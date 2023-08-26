const express = require("express");
const router = express.Router();
const { isAdmin, authentication } = require("../middlewares/authenticaton");

const {
  createProduct,
  getaProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

router.post("/createProduct", authentication, isAdmin, createProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/:id", getaProduct);
router.put("/:id", authentication, isAdmin, updateProduct);
router.delete("/:id", authentication, isAdmin, deleteProduct);

module.exports = router;
