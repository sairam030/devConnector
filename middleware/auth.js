const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  // Get token from header
  // The header key to look for is "x-auth-token"
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    // 401 = unauthorized
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify token
  try {
    // Decode token
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    // Set req.user to the user in the decoded token
    req.user = decoded.user;

    // Call next() to move on to the next middleware
    next();
  } catch (err) {
    // 401 = unauthorized
    res.status(401).json({ msg: "Token is not valid" });
  }
};
