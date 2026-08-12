const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const db = require("./db");
const crypto = require("crypto");
const { sendResetEmail } = require("./utils/mailer");
const { pushSnapToGithub, processGifUrl } = require("./utils/githubGif");
const {
  signToken,
  requireAuth,
  requireRole,
  requireSelfOrAdmin,
} = require("./utils/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Render (and most hosts) sit behind a reverse proxy that sets
// X-Forwarded-For. Without this, express-rate-limit can't tell requests
// apart by IP and throws ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
// `1` = trust exactly one hop (Render's proxy) — safer than `true`,
// which would trust the header no matter how many proxies forwarded it.
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://cms-user.netlify.app",
      "https://cms-admin-portal.netlify.app",
      "https://cms-user-theta.vercel.app",
      "https://cms-admin-gilt-nu.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Applies only to the two login endpoints — throttles credential
// stuffing / brute force attempts. Tune `max` as needed.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

const resetTokens = new Map(); // token -> { email, accountType, expiresAt }

app.post("/api/forgot-password", loginLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    let accountType = null;
    let [rows] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      accountType = "admin";
    } else {
      [rows] = await db.query("SELECT id FROM customers WHERE email = ?", [email]);
      if (rows.length > 0) {
        accountType = "customer";
      }
    }

    if (accountType) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
      resetTokens.set(token, { email, accountType, expiresAt });

      // Dynamically get the frontend URL from the request Origin or Referer header.
      // This way it automatically works on localhost, Vercel preview URLs, and production.
      let frontendUrl = req.headers.origin;
      if (!frontendUrl && req.headers.referer) {
        try {
          const parsedReferer = new URL(req.headers.referer);
          frontendUrl = parsedReferer.origin;
        } catch (e) {
          // ignore parsing error
        }
      }
      if (!frontendUrl) {
        frontendUrl = accountType === "admin" 
          ? "http://localhost:5174" 
          : "http://localhost:5173";
      }
      
      const resetLink = `${frontendUrl}/reset-password?token=${token}`;
      await sendResetEmail(email, resetLink);
    }
    
    // Always return success to prevent email enumeration
    res.json({ success: true, message: "If an account with that email exists, we have sent a password reset link." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Failed to process request" });
  }
});

app.post("/api/reset-password", loginLimiter, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: "Token and new password are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
  }

  const tokenData = resetTokens.get(token);
  if (!tokenData || tokenData.expiresAt < Date.now()) {
    if (tokenData) resetTokens.delete(token);
    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const table = tokenData.accountType === "admin" ? "users" : "customers";
    
    await db.query(`UPDATE ${table} SET password = ? WHERE email = ?`, [hashed, tokenData.email]);
    resetTokens.delete(token); // invalidate token

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});

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

// ---------- Public content (no auth needed — this is what cms-frontend reads) ----------

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

// ---------- Admin-only stats & dashboard ----------

app.get("/api/stats", requireAuth, requireRole("admin"), async (req, res) => {
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

// ---------- Posts (admin write access) ----------

app.post("/api/posts", requireAuth, requireRole("admin"), async (req, res) => {
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

app.put(
  "/api/posts/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
      res
        .status(500)
        .json({ success: false, message: "Failed to update post" });
    }
  },
);

app.patch(
  "/api/posts/reorder",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
  },
);

app.patch(
  "/api/posts/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
      res
        .status(500)
        .json({ success: false, message: "Failed to update post" });
    }
  },
);

app.delete(
  "/api/posts/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "Post deleted" });
    } catch (err) {
      console.error("Error deleting post:", err.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete post" });
    }
  },
);

// ---------- Admin login ----------

app.post("/api/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);

  if (!rows.length) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const user = rows[0];
  const passwordOk = await bcrypt.compare(password, user.password);

  if (!passwordOk) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  // user.role comes from the `role` column (defaults to "user" if unset).
  const token = signToken({ id: user.id, role: user.role || "user" });
  const { password: _pw, ...safeUser } = user;

  res.json({ success: true, token, user: safeUser });
});

// ---------- Customers (public signup/login, everything else locked down) ----------

app.post("/api/customers/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, hashed],
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

app.post("/api/customers/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query("SELECT * FROM customers WHERE email = ?", [
    email,
  ]);

  const match =
    rows.length && (await bcrypt.compare(password, rows[0].password));

  if (!match) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const { password: _pw, ...customer } = rows[0];
  const token = signToken({ id: customer.id, role: "customer" });
  res.json({ success: true, token, customer });
});

// Admin-only: list every customer.
app.get(
  "/api/customers",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
  },
);

// Admin-only: remove a customer account.
app.delete(
  "/api/customers/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      await db.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "Customer deleted" });
    } catch (err) {
      console.error("Error deleting customer:", err.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete customer" });
    }
  },
);

// A customer can read their own profile; an admin can read anyone's. (IDOR fix)
app.get(
  "/api/customers/:id",
  requireAuth,
  requireSelfOrAdmin("id"),
  async (req, res) => {
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
  },
);

// A customer can edit only their own profile; an admin can edit anyone's. (IDOR fix)
app.put(
  "/api/customers/:id",
  requireAuth,
  requireSelfOrAdmin("id"),
  async (req, res) => {
    const { name, email, phone, currentPassword, newPassword } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    try {
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
        const currentOk =
          rows.length &&
          (await bcrypt.compare(currentPassword, rows[0].password));
        if (!currentOk) {
          return res
            .status(401)
            .json({ success: false, message: "Current password is incorrect" });
        }
      }

      if (newPassword) {
        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query(
          "UPDATE customers SET name = ?, email = ?, phone = ?, password = ? WHERE id = ?",
          [name, email, phone || null, hashed, req.params.id],
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
  },
);

// ---------- Quick Bites (public reads, admin writes) ----------

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

app.post(
  "/api/quickbites",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
  },
);

app.put(
  "/api/quickbites/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
  },
);

app.patch(
  "/api/quickbites/reorder",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "orderedIds array required" });
    }
    try {
      const updates = orderedIds.map((id, index) =>
        db.query("UPDATE quick_bites SET priority = ? WHERE id = ?", [
          index,
          id,
        ]),
      );
      await Promise.all(updates);
      res.json({ success: true, message: "Order saved" });
    } catch (err) {
      console.error("Error saving order:", err.message);
      res.status(500).json({ success: false, message: "Failed to save order" });
    }
  },
);

app.delete(
  "/api/quickbites/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      await db.query("DELETE FROM quick_bites WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "Quick bite deleted" });
    } catch (err) {
      console.error("Error deleting quick bite:", err.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete quick bite" });
    }
  },
);

// ---------- Admin users (the CMS staff / "users" table) ----------

app.get("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error("Error fetching users:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

const ALLOWED_STAFF_ROLES = ["user", "admin"];

app.post("/api/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required",
    });
  }

  const finalRole = ALLOWED_STAFF_ROLES.includes(role) ? role : "user";

  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, finalRole],
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

app.delete(
  "/api/users/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "User deleted" });
    } catch (err) {
      console.error("Error deleting user:", err.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete user" });
    }
  },
);

// ---------- Visit tracking (public write, admin-only read of aggregate stats) ----------

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

app.get(
  "/api/visits/stats",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
  },
);

// ---------- Categories (public read, admin write) ----------

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

app.post(
  "/api/categories",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
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
  },
);

app.put(
  "/api/categories/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { name, gif_url } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    try {
      await db.query(
        "UPDATE categories SET name = ?, gif_url = ? WHERE id = ?",
        [name.trim(), gif_url || null, req.params.id],
      );
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
  },
);

app.delete(
  "/api/categories/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      await db.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "Category deleted" });
    } catch (err) {
      console.error("Error deleting category:", err.message);
      res
        .status(500)
        .json({ success: false, message: "Failed to delete category" });
    }
  },
);

// ---------- Snaps ----------

const multer = require("multer");
const { fileTypeFromBuffer } = require("file-type");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

const ALLOWED_SNAP_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// GitHub push + GIF fetch/optimize/rehost logic lives in
// ./utils/githubGif.js (pushSnapToGithub, processGifUrl) so the same code
// is shared with the one-off backfill script (scripts/backfillGifs.js).

app.post(
  "/api/snaps",
  requireAuth,
  requireRole("customer"),
  upload.single("snap"),
  async (req, res) => {
    const { caption } = req.body;
    // Trust the authenticated user's id, never a client-supplied customer_id —
    // otherwise a customer could upload and attribute a snap to anyone.
    const customer_id = req.user.id;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Snap image is required" });
    }

    try {
      const detected = await fileTypeFromBuffer(req.file.buffer);
      if (!detected || !ALLOWED_SNAP_MIME_TYPES.includes(detected.mime)) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Unsupported or invalid image file",
          });
      }

      const filename = `${customer_id}_${Date.now()}.${detected.ext}`;
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
      res
        .status(500)
        .json({ success: false, message: "Failed to upload snap" });
    }
  },
);

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

app.post(
  "/api/snaps/:id/react",
  requireAuth,
  requireRole("customer"),
  async (req, res) => {
    const customer_id = req.user.id; // trust the token, not the body
    const { reaction_type } = req.body;
    const allowed = ["like", "smile", "tongue"];

    if (!allowed.includes(reaction_type)) {
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
  },
);

// Only the snap's owner or an admin can delete it.
app.delete("/api/snaps/:id", requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT customer_id FROM snaps WHERE id = ?",
      [req.params.id],
    );
    if (!rows.length) {
      return res
        .status(404)
        .json({ success: false, message: "Snap not found" });
    }
    const isOwner =
      req.user.role === "customer" && req.user.id === rows[0].customer_id;
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

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
