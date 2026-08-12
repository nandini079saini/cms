const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  // Fail loudly at boot rather than silently signing tokens with `undefined`.
  throw new Error(
    "JWT_SECRET is not set. Add a long random string to your .env file, e.g.\n" +
      "JWT_SECRET=" +
      require("crypto").randomBytes(32).toString("hex"),
  );
}

/**
 * Signs a short-lived JWT for a logged-in user or customer.
 * payload should be minimal: { id, role } — role is "admin" | "customer".
 */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

/**
 * Middleware: requires a valid "Authorization: Bearer <token>" header.
 * On success, attaches { id, role } to req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authenticated" });
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired session" });
  }
}

/**
 * Middleware factory: requires req.user.role to be one of the allowed roles.
 * Must be used AFTER requireAuth.
 *   requireRole("admin")
 *   requireRole("admin", "customer")
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

/**
 * Middleware factory for "self or admin" routes, e.g. a customer editing
 * their own profile. Compares req.user.id against a route param.
 *   requireSelfOrAdmin("id")
 */
function requireSelfOrAdmin(paramName = "id") {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    const isSelf = String(req.user.id) === String(req.params[paramName]);
    const isAdmin = req.user.role === "admin";
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole, requireSelfOrAdmin };
