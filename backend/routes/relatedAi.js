const express = require("express");
const router = express.Router();
const db = require("../db");
const { callNvidiaLLM } = require("../services/nvidiaClient");

const CACHE_MAX_AGE_DAYS = 7;

router.get("/api/posts/:id/related-ai", async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit) || 5;
  const forceRefresh = req.query.refresh === "true";

  try {
    const [[target]] = await db.query(
      `SELECT id, title, excerpt, category, tags FROM posts WHERE id = ?`,
      [id],
    );
    if (!target) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // check cache first-look for entried younger than 7 days
    if (!forceRefresh) {
      const [[cached]] = await db.query(
        `SELECT related_json, generated_at FROM related_ai_cache WHERE post_id = ?`,
        [id],
      );
      if (cached) {
        const ageDays =
          (Date.now() - new Date(cached.generated_at)) / (1000 * 60 * 60 * 24);
        if (ageDays < CACHE_MAX_AGE_DAYS) {
          const ids =
            typeof cached.related_json === "string"
              ? JSON.parse(cached.related_json)
              : cached.related_json;
          const related = await hydratePosts(ids, limit);
          return res.json({ success: true, related, cached: true });
        }
      }
    }

    // same category first, then fallback to any category if not enough candidates
    let [candidates] = await db.query(
      `SELECT id, title, excerpt, category, tags FROM posts
       WHERE id != ? AND status = 'published' AND category = ?
       ORDER BY created_at DESC LIMIT 30`,
      [id, target.category],
    );

    if (candidates.length < 10) {
      [candidates] = await db.query(
        `SELECT id, title, excerpt, category, tags FROM posts
         WHERE id != ? AND status = 'published'
         ORDER BY created_at DESC LIMIT 40`,
        [id],
      );
    }

    if (candidates.length === 0) {
      return res.json({ success: true, related: [], cached: false });
    }

    // Ask the LLM to rank candidates by relevance
    const candidateList = candidates
      .map(
        (c) =>
          `ID:${c.id} | Title: ${c.title} | Category: ${c.category} | Tags: ${
            c.tags || "-"
          } | Excerpt: ${(c.excerpt || "").slice(0, 120)}`,
      )
      .join("\n");

    const prompt = `You are a content recommendation engine.

TARGET ARTICLE:
Title: ${target.title}
Category: ${target.category}
Tags: ${target.tags || "-"}
Excerpt: ${target.excerpt || "-"}

CANDIDATE ARTICLES:
${candidateList}

Pick the ${limit} candidate articles most related to the target article by topic, category, and tags.
Respond with ONLY a JSON array of the candidate IDs, ordered most to least related, nothing else. Example: [12, 4, 7]`;

    const raw = await callNvidiaLLM([{ role: "user", content: prompt }]);

    let ids;
    try {
      ids = JSON.parse(raw.trim().replace(/```json|```/g, ""));
    } catch {
      return res
        .status(502)
        .json({ success: false, error: "Failed to parse LLM response", raw });
    }

    // Cache the result (upsert)
    await db.query(
      `INSERT INTO related_ai_cache (post_id, related_json, generated_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE related_json = VALUES(related_json), generated_at = NOW()`,
      [id, JSON.stringify(ids)],
    );

    const related = await hydratePosts(ids, limit, candidates);
    res.json({ success: true, related, cached: false });
  } catch (err) {
    console.error("related-ai error:", err.message);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Turns a list of post IDs into full post rows, preserving the LLM's ranking order
async function hydratePosts(ids, limit, preloaded = null) {
  const trimmedIds = ids.slice(0, limit);
  if (trimmedIds.length === 0) return [];

  if (preloaded) {
    const byId = new Map(preloaded.map((c) => [c.id, c]));
    return trimmedIds.map((tid) => byId.get(tid)).filter(Boolean);
  }

  const [rows] = await db.query(
    `SELECT id, title, excerpt, category, tags, slug, gif_url FROM posts WHERE id IN (?)`,
    [trimmedIds],
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  return trimmedIds.map((tid) => byId.get(tid)).filter(Boolean);
}

module.exports = router;
