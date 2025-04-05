const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorisation"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer token"

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
