const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "safeworld-dev-secret-change-in-production";

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Sign in required." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

function requireVolunteerOrAdmin(req, res, next) {
  if (!req.user || !["volunteer", "admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "Only volunteers or admins can do this." });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

// Attaches req.user if a valid token is present, but never blocks the request.
function attachUserIfPresent(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      /* ignore invalid token, treat as anonymous */
    }
  }
  next();
}

module.exports = { signToken, requireAuth, requireVolunteerOrAdmin, requireAdmin, attachUserIfPresent, JWT_SECRET };
