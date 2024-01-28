const express = require("express");
const router = express.Router();
const { isAdmin, authentication } = require("../middlewares/authenticaton");
const {
  createProduct,
  getaProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
  uploadImages,
} = require("../controllers/product");
const {
  uploadPhoto,
  productImageResize,
} = require("../middlewares/uploadImages");

router.post("/createProduct", authentication, isAdmin, createProduct);
router.put(
  "/upload/:id",
  authentication,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImageResize,
  uploadImages
);
router.get("/getAllProducts", getAllProducts);
router.put("/rating", authentication, rating);
router.get("/:id", getaProduct);
router.put("/:id", authentication, isAdmin, updateProduct);
router.delete("/:id", authentication, isAdmin, deleteProduct);

module.exports = router;
