const express = require("express");
const router = express.Router();

const { authentication, isAdmin } = require("../middlewares/authenticaton");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
} = require("../controllers/category");

router.post("/createCategory", authentication, isAdmin, createCategory);
router.get("/getAllCategory", authentication, isAdmin, getAllCategory);
router.put("/:id", authentication, isAdmin, updateCategory);
router.delete("/:id", authentication, isAdmin, deleteCategory);
router.get("/:id", authentication, isAdmin, getCategory);

module.exports = router;
