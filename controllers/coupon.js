const Coupon = require("../models/coupon");
const validateMongoId = require("../utils/validateMongoId");
const asyncHandler = require("express-async-handler");

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json({ coupon });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ coupons });
  } catch (error) {
    throw new Error(error);
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ coupon });
  } catch (error) {
    throw new Error(error);
  }
});
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    await Coupon.findByIdAndDelete(id);
    res.json({ msg: "Coupon deleted successfully" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = { createCoupon, getAllCoupons, updateCoupon, deleteCoupon };
