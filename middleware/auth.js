const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/auth");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "tokenが必要です。" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Bearer token形式で指定してください。" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "tokenが無効です。" });
  }
}

module.exports = {
  authMiddleware,
};
