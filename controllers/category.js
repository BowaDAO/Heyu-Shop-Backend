const Category = require("../models/category");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongoId");

//Product category controller
const createCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json({ category });
  } catch (error) {
    throw new Error(error);
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({ category });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    await Category.findByIdAndDelete(id);
    res.json({ message: "deleted successfully" });
  } catch (error) {
    throw new Error(error);
  }
});
const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const category = await Category.findById(id);
    res.json({ category });
  } catch (error) {
    throw new Error(error);
  }
});
const getAllCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.find();
    res.json({ category });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
};
