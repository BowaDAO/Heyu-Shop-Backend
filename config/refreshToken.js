const jwt = require("jsonwebtoken");

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_LIFETIME,
  });
};

module.exports = generateRefreshToken;
