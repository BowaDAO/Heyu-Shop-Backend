const Brand = require("../models/brand");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongoId");

const createBrand = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.create(req.body);
    res.json({ brand });
  } catch (error) {
    throw new Error(error);
  }
});
const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const brand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ brand });
  } catch (error) {
    throw new Error(error);
  }
});

const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const brand = await Brand.findById(id);
    res.json({ brand });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBrands = asyncHandler(async (req, res) => {
  try {
    const brand = await Brand.find();
    res.json({ brand });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    await Brand.findByIdAndDelete(id);
    res.json({ message: "Brand deleted" });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createBrand,
  updateBrand,
  getBrand,
  getAllBrands,
  deleteBrand,
};
