const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const { pushSnapToGithub, processGifUrl } = require("./utils/githubGif");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://cms-user.netlify.app",
      "https://cms-admin-portal.netlify.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

setInterval(async () => {
  try {
    const [result] = await db.query(`
      UPDATE posts
      SET status = 'published', published_at = NOW()
      WHERE status = 'scheduled'
      AND scheduled_at <= DATE_ADD(NOW(), INTERVAL 330 MINUTE)
    `);
    if (result.affectedRows > 0) {
      console.log("Auto-published:", result.affectedRows, "post(s)");
    }
  } catch (err) {
    console.error("Auto-publish interval error:", err.message);
  }
}, 60000);

app.get("/api/posts", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit);

    let query = `
      SELECT *
      FROM posts
      WHERE status = 'published'
      ORDER BY priority ASC, published_at DESC
    `;

    const params = [];

    if (!isNaN(limit)) {
      query += " LIMIT ?";
      params.push(limit);
    }

    const [rows] = await db.query(query, params);

    res.json({
      success: true,
      posts: rows,
    });
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const [[published]] = await db.query(
      "SELECT COUNT(*) count FROM posts WHERE status='published'",
    );
    const [[drafts]] = await db.query(
      "SELECT COUNT(*) count FROM posts WHERE status='draft'",
    );
    const [[scheduled]] = await db.query(
      "SELECT COUNT(*) count FROM posts WHERE status='scheduled'",
    );
    const [[total]] = await db.query("SELECT COUNT(*) count FROM posts");
    const [[users]] = await db.query("SELECT COUNT(*) count FROM users");
    const [[viewers]] = await db.query(
      "SELECT COUNT(DISTINCT visitor_id) count FROM customer_visits",
    );

    res.json({
      total: total.count,
      published: published.count,
      drafts: drafts.count,
      scheduled: scheduled.count,
      users: users.count,
      viewers: viewers.count,
    });
  } catch (err) {
    console.error("Error fetching stats:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

app.post("/api/posts", async (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    author,
    status,
    scheduled_at,
    gif_url,
  } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  const finalSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  const published_at = status === "published" ? new Date() : null;

  try {
    const optimizedGifUrl = await processGifUrl(gif_url);

    const [result] = await db.query(
      "INSERT INTO posts (title, slug, excerpt, content, category, tags, author, status, scheduled_at, published_at,gif_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
      [
        title,
        finalSlug,
        excerpt || null,
        content || null,
        category || null,
        tags || null,
        author || null,
        status || "draft",
        scheduled_at || null,
        published_at,
        optimizedGifUrl,
      ],
    );
    res.status(201).json({
      success: true,
      message: "Post saved successfully",
      postId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A post with this slug already exists",
      });
    }
    console.error("Error saving post:", err.message);
    res.status(500).json({ success: false, message: "Failed to save post" });
  }
});

app.get("/api/posts/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM posts WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, post: rows[0] });
  } catch (err) {
    console.error("Error fetching post:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch post" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

  if (!rows.length) {
    return res.status(401).json({ success: false });
  }

  const user = rows[0];

  if (user.password !== password) {
    return res.status(401).json({ success: false });
  }

  res.json({ success: true, user });
});

app.post("/api/customers/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, password],
    );
    res.status(201).json({
      success: true,
      message: "Account created",
      customerId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }
    res.status(500).json({ success: false, message: "Signup failed" });
  }
});

app.use(require("./routes/relatedAi"));

app.post("/api/customers/login", async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query("SELECT * FROM customers WHERE email = ?", [
    email,
  ]);

  if (!rows.length || rows[0].password !== password) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const { password: _pw, ...customer } = rows[0];
  res.json({ success: true, customer });
});

app.get("/api/customers", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, created_at FROM customers ORDER BY created_at DESC",
    );
    res.json({ success: true, customers: rows });
  } catch (err) {
    console.error("Error fetching customers:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customers" });
  }
});

app.delete("/api/customers/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    console.error("Error deleting customer:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete customer" });
  }
});

app.get("/api/customers/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, phone, created_at FROM customers WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, customer: rows[0] });
  } catch (err) {
    console.error("Error fetching customer:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customer" });
  }
});

app.put("/api/customers/:id", async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Name and email are required" });
  }

  try {
    // If changing password, verify the current one first
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password is required to set a new password",
        });
      }
      const [rows] = await db.query(
        "SELECT password FROM customers WHERE id = ?",
        [req.params.id],
      );
      if (!rows.length || rows[0].password !== currentPassword) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect" });
      }
    }

    if (newPassword) {
      await db.query(
        "UPDATE customers SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?",
        [name, email, phone || null, newPassword, req.params.id],
      );
    } else {
      await db.query(
        "UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?",
        [name, email, phone || null, req.params.id],
      );
    }

    const [rows] = await db.query(
      "SELECT id, name, email, phone, created_at FROM customers WHERE id = ?",
      [req.params.id],
    );
    res.json({
      success: true,
      message: "Profile updated",
      customer: rows[0],
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }
    console.error("Error updating customer:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update profile" });
  }
});

app.put("/api/posts/:id", async (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    category,
    tags,
    author,
    status,
    scheduled_at,
    gif_url,
  } = req.body;

  const published_at = status === "published" ? new Date() : null;

  try {
    const optimizedGifUrl = await processGifUrl(gif_url);

    await db.query(
      `UPDATE posts SET
        title = ?, slug = ?, excerpt = ?, content = ?,
        category = ?, tags = ?, author = ?, status = ?,
        scheduled_at = ?, published_at = ?,gif_url=? 
       WHERE id = ?`,
      [
        title,
        slug,
        excerpt,
        content,
        category,
        tags,
        author,
        status,
        scheduled_at || null,
        published_at,
        optimizedGifUrl,
        req.params.id,
      ],
    );
    res.json({ success: true, message: "Post updated successfully" });
  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
});

app.patch("/api/posts/reorder", async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "orderedIds array required" });
  }
  try {
    const updates = orderedIds.map((id, index) =>
      db.query("UPDATE posts SET priority = ? WHERE id = ?", [index, id]),
    );
    await Promise.all(updates);
    res.json({ success: true, message: "Order saved" });
  } catch (err) {
    console.error("Error saving order:", err.message);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

app.patch("/api/posts/:id", async (req, res) => {
  const { status } = req.body;
  const published_at = status === "published" ? new Date() : null;
  try {
    await db.query(
      "UPDATE posts SET status = ?, published_at = ? WHERE id = ?",
      [status, published_at, req.params.id],
    );
    res.json({ success: true, message: "Post updated" });
  } catch (err) {
    console.error("Error updating post:", err.message);
    res.status(500).json({ success: false, message: "Failed to update post" });
  }
});

app.delete("/api/posts/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
});

// ---------- Quick Bites ----------

app.get("/api/quickbites", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM quick_bites ORDER BY priority ASC, created_at DESC",
    );
    res.json({ success: true, quickBites: rows });
  } catch (err) {
    console.error("Error fetching quick bites:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch quick bites" });
  }
});

app.get("/api/quickbites/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM quick_bites WHERE id = ?", [
      req.params.id,
    ]);
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Quick bite not found" });
    }
    res.json({ success: true, quickBite: rows[0] });
  } catch (err) {
    console.error("Error fetching quick bite:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch quick bite" });
  }
});

app.post("/api/quickbites", async (req, res) => {
  const { title, excerpt, gif_url } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  if (!gif_url) {
    return res
      .status(400)
      .json({ success: false, message: "GIF URL is required" });
  }

  try {
    const optimizedGifUrl = await processGifUrl(gif_url);

    const [result] = await db.query(
      "INSERT INTO quick_bites (title, excerpt, gif_url) VALUES (?, ?, ?)",
      [title, excerpt || null, optimizedGifUrl],
    );
    res.status(201).json({
      success: true,
      message: "Quick bite saved successfully",
      quickBiteId: result.insertId,
    });
  } catch (err) {
    console.error("Error saving quick bite:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to save quick bite" });
  }
});

app.put("/api/quickbites/:id", async (req, res) => {
  const { title, excerpt, gif_url } = req.body;

  if (!title) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required" });
  }

  try {
    const optimizedGifUrl = gif_url ? await processGifUrl(gif_url) : null;

    await db.query(
      "UPDATE quick_bites SET title = ?, excerpt = ?, gif_url = ? WHERE id = ?",
      [title, excerpt || null, optimizedGifUrl, req.params.id],
    );
    res.json({ success: true, message: "Quick bite updated successfully" });
  } catch (err) {
    console.error("Error updating quick bite:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update quick bite" });
  }
});

app.patch("/api/quickbites/reorder", async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "orderedIds array required" });
  }
  try {
    const updates = orderedIds.map((id, index) =>
      db.query("UPDATE quick_bites SET priority = ? WHERE id = ?", [index, id]),
    );
    await Promise.all(updates);
    res.json({ success: true, message: "Order saved" });
  } catch (err) {
    console.error("Error saving order:", err.message);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

app.delete("/api/quickbites/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM quick_bites WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Quick bite deleted" });
  } catch (err) {
    console.error("Error deleting quick bite:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete quick bite" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

app.post("/api/users", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
    );
    res.status(201).json({
      success: true,
      message: "User created",
      userId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists",
      });
    }
    console.error("Error creating user:", err.message);
    res.status(500).json({ success: false, message: "Failed to create user" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

app.post("/api/visit", async (req, res) => {
  const { visitor_id, page, category = null, post_id = null } = req.body;

  try {
    await db.query(
      `INSERT INTO customer_visits
      (visitor_id, page, category, post_id)
      VALUES (?, ?, ?, ?)`,
      [visitor_id, page || "Home", category, post_id],
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving visit:", err.message);
    res.status(500).json({ success: false });
  }
});

app.get("/api/visits/stats", async (req, res) => {
  try {
    const [[total]] = await db.query(
      "SELECT COUNT(*) count FROM customer_visits",
    );
    const [[unique]] = await db.query(
      "SELECT COUNT(DISTINCT visitor_id) count FROM customer_visits",
    );
    const [recent] = await db.query(
      "SELECT * FROM customer_visits ORDER BY visited_at DESC LIMIT 10",
    );
    res.json({ total: total.count, unique: unique.count, recent });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY name ASC");
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch categories" });
  }
});

app.post("/api/categories", async (req, res) => {
  const { name, gif_url } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Category name is required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO categories (name, gif_url) VALUES (?, ?)",
      [name.trim(), gif_url || null],
    );
    res.status(201).json({
      success: true,
      message: "Category created",
      categoryId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });
    }
    console.error("Error creating category:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to create category" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  const { name, gif_url } = req.body;

  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Category name is required" });
  }

  try {
    await db.query("UPDATE categories SET name = ?, gif_url = ? WHERE id = ?", [
      name.trim(),
      gif_url || null,
      req.params.id,
    ]);
    res.json({ success: true, message: "Category updated" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ success: false, message: "Category already exists" });
    }
    console.error("Error updating category:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to update category" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete category" });
  }
});

const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

// GitHub push + GIF fetch/optimize/rehost logic lives in
// ./utils/githubGif.js (pushSnapToGithub, processGifUrl) so the same code
// is shared with the one-off backfill script (scripts/backfillGifs.js).

app.post("/api/snaps", upload.single("snap"), async (req, res) => {
  const { customer_id, caption } = req.body;

  if (!customer_id) {
    return res
      .status(400)
      .json({ success: false, message: "customer_id is required" });
  }
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "Snap image is required" });
  }

  try {
    const ext = (req.file.originalname.split(".").pop() || "jpg").toLowerCase();
    const filename = `${customer_id}_${Date.now()}.${ext}`;
    const { url, path } = await pushSnapToGithub(req.file.buffer, filename);

    const [result] = await db.query(
      "INSERT INTO snaps (customer_id, image_url, github_path, caption) VALUES (?, ?, ?, ?)",
      [customer_id, url, path, caption || null],
    );

    res.status(201).json({
      success: true,
      message: "Snap uploaded",
      snapId: result.insertId,
      image_url: url,
    });
  } catch (err) {
    console.error("Error creating snap:", err.message);
    res.status(500).json({ success: false, message: "Failed to upload snap" });
  }
});

app.get("/api/snaps", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.image_url, s.caption, s.created_at,
             c.id AS customer_id, c.name AS customer_name,
             COALESCE(SUM(r.reaction_type = 'like'), 0) AS likes,
             COALESCE(SUM(r.reaction_type = 'smile'), 0) AS smiles,
             COALESCE(SUM(r.reaction_type = 'tongue'), 0) AS tongues
      FROM snaps s
      JOIN customers c ON c.id = s.customer_id
      LEFT JOIN snap_reactions r ON r.snap_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    res.json({ success: true, snaps: rows });
  } catch (err) {
    console.error("Error fetching snaps:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch snaps" });
  }
});

app.post("/api/snaps/:id/react", async (req, res) => {
  const { customer_id, reaction_type } = req.body;
  const allowed = ["like", "smile", "tongue"];

  if (!customer_id || !allowed.includes(reaction_type)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid reaction" });
  }

  try {
    const [existing] = await db.query(
      "SELECT id FROM snap_reactions WHERE snap_id = ? AND customer_id = ? AND reaction_type = ?",
      [req.params.id, customer_id, reaction_type],
    );

    if (existing.length) {
      await db.query("DELETE FROM snap_reactions WHERE id = ?", [
        existing[0].id,
      ]);
      return res.json({ success: true, action: "removed" });
    }

    await db.query(
      "INSERT INTO snap_reactions (snap_id, customer_id, reaction_type) VALUES (?, ?, ?)",
      [req.params.id, customer_id, reaction_type],
    );
    res.json({ success: true, action: "added" });
  } catch (err) {
    console.error("Error saving reaction:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to save reaction" });
  }
});

app.delete("/api/snaps/:id", async (req, res) => {
  try {
    // Note: this removes the DB row only. The image stays in the GitHub repo
    // unless you also call the Contents API's DELETE endpoint with the file's
    // sha (fetch it via a GET on the same content path first).
    await db.query("DELETE FROM snaps WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Snap deleted" });
  } catch (err) {
    console.error("Error deleting snap:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete snap" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
