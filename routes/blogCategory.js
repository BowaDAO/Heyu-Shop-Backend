const express = require("express");
const router = express.Router();

const { authentication, isAdmin } = require("../middlewares/authenticaton");
const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategory,
} = require("../controllers/blogCategory");

router.post("/createCategory", authentication, isAdmin, createCategory);
router.get("/getAllCategory", authentication, isAdmin, getAllCategory);
router.get("/:id", authentication, isAdmin, getCategory);
router.put("/:id", authentication, isAdmin, updateCategory);
router.delete("/:id", authentication, isAdmin, deleteCategory);

module.exports = router;
