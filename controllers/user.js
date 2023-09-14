const { createToken } = require("../config/token");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongoId");
const generateRefreshToken = require("../config/refreshToken");
const jwt = require("jsonwebtoken");
const sendEmail = require("./email");
const crypto = require("crypto");

//Create a user account
const createUser = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    //create a new user account
    const newUser = await User.create({ ...req.body });
    res.json({ newUser });
  } else {
    //user already exists
    throw new Error("User already exists");
  }
});

//Login a user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user has inputted credentials or not
  if (!email || !password) {
    throw new Error("Please provide email and password");
  }
  //check if user exists or not
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  //check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new Error("Incorrect password");
  }
  //Generate user refresh token
  const refreshToken = await generateRefreshToken(user?.id);
  await User.findByIdAndUpdate(user?.id, { refreshToken }, { new: true });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 72 * 60 * 60 * 1000,
  });

  //send a response if there is a valid user
  res.json({
    _id: user?._id,
    firstname: user?.firstname,
    lastname: user?.lastname,
    email: user?.email,
    mobile: user?.mobile,
    token: createToken(user?._id),
  });
});

//Admin login
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if admin exists or not
  const admin = await User.findOne({ email });
  if (admin.role !== "admin") {
    throw new Error("Not Authorised");
  }
  //check if password is correct
  const isPasswordCorrect = await admin.comparePassword(password);
  if (admin && isPasswordCorrect) {
    //generate admin refresh token
    const refreshToken = await generateRefreshToken(admin?._id);
    await User.findByIdAndUpdate(admin?.id, { refreshToken }, { new: true });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    //send a response if there is a valid admin
    res.json({
      _id: admin?._id,
      firstname: admin?.firstname,
      lastname: admin?.lastname,
      email: admin?.email,
      mobile: admin?.mobile,
      token: createToken(admin?._id),
    });
  }
});

//handling refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
  //get cookie from the request
  const cookie = req.cookies;
  //if there is none, throw error
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
  //get refresh token if there is
  const refreshToken = cookie.refreshToken;
  //find a user with the refresh token
  const user = await User.findOne({ refreshToken });
  //throw error if no refresh token for user
  if (!user) throw new Error("No refresh token");
  // otherwise verify the refresh token
  jwt.verify(refreshToken, process.env.JST_SECRET, (error, decoded) => {
    if (error || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    } else {
      const accessToken = generateToken(user?.id);
      res.json({ accessToken });
    }
  });
  res.json({ user });
});

//Log a user out
const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(StatusCodes.FORBIDDEN);
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(StatusCodes.FORBIDDEN);
});

//Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    throw new Error(error);
  }
});

//Get a user
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const user = await User.findById(id);
    //check if user exists or not
    if (!user) {
      throw new Error(`no user with the id ${id}`);
    }
    res.json({ user });
  } catch (error) {
    throw new Error(error);
  }
});

//Delete a user account
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const user = await User.findByIdAndDelete(id);
    //check if user exists or not
    if (!user) {
      throw new Error(`no user with the id ${id}`);
    }
    res.json({ msg: `user with ${id} deleted` });
  } catch (error) {
    throw new Error(error);
  }
});

//Update a user info
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  //validate the id before processing the update
  validateMongoId(_id);
  const { firstname, lastname, email, mobile } = req.body;
  try {
    //check if credentials have value
    if (!firstname || !lastname || !email || !mobile) {
      throw new Error("Field cannot be empty");
    }
    const user = await User.findByIdAndUpdate(_id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ user });
  } catch (error) {
    throw new Error(error);
  }
});

//Block a user
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
    res.json({ msg: "User account has been blocked" });
  } catch (error) {
    throw new Error(error);
  }
});

//unblock a user
const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
    res.json({ msg: "User account has been unblocked" });
  } catch (error) {
    throw new Error(error);
  }
});

//update user password
const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const newPassword = await user.save();
    res.json(newPassword);
  } else {
    res.json(user);
  }
});

//generating forgot password token
const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User with this email not found");
  }
  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetUrl = `Hi, follow this link to reset your password. Link expires in 10 minutes from now <a href= "http://localhost:4000/api/v1/auth/reset-password/${token} >Click Here</a> `;
    const data = {
      to: email,
      text: "reset your password",
      subject: "forgot passsword link",
      html: resetUrl,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error("Token expired, please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});

//Function for a user to add and remove product from wishlist.
const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    //Checking if the product has already been added to wishlist
    const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: prodId } },
        { new: true }
      );
      res.json({ user });
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: prodId } },
        { new: true }
      );
      res.json({ user });
    }
  } catch (error) {
    throw new Error(error);
  }
});

//Function to get products from wishlist
const getWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const user = await User.findById(_id).populate("wishlist");
    const wishlist = user.wishlist;
    res.json({ wishlist });
  } catch (error) {
    throw new Error(error);
  }
});

//Function to save a user address
const saveUserAddress = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const { address } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      { address: address },
      { new: true }
    );
    res.json({ user });
  } catch (error) {
    throw new Error(error);
  }
});

const addToCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  const { cart } = req.body;
  try {
    let products = [];
    const user = await User.findById(_id);
    //Checking if the user already has aan active cart
    const alreadyExist = await Cart.findOne({ orderBy: user._id });
    if (alreadyExist) {
      alreadyExist.remove();
    }
    //////////////
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; 1 < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderBy: user?._id,
    }).save();
    res.json({ newCart });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUser,
  getAllUsers,
  getUser,
  deleteUser,
  updateUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  adminLogin,
  addToWishList,
  getWishList,
  saveUserAddress,
  addToCart,
};
