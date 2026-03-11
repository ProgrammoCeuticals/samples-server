const { verifyAdminToken } = require("../utils/adminAuth");

function requireAdminAuth(req, res, next) {
  const header = `${req.headers.authorization || ""}`;
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({ error: "Admin authentication required" });
    return;
  }

  try {
    req.adminSession = verifyAdminToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired admin token" });
  }
}

module.exports = {
  requireAdminAuth,
};
