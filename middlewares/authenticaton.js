const User = require("../models/user");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authentication = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    const token = authHeader.split(" ")[1];

    try {
      const query = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(query?.id);
      req.user = user;
      next();
    } catch (error) {
      throw new Error("Not authorized, please login again");
    }
  } else {
    throw new Error("Invalid authentication");
  }
});

const isAdmin = asyncHandler(async (req, res, next) => {
  const { email } = req.user;
  const admin = await User.findOne({ email });
  if (admin.role !== "admin") {
    throw new Error("You are not authorized to access admin page");
  } else {
    next();
  }
});
module.exports = { authentication, isAdmin };
