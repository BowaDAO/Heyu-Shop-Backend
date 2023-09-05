const express = require("express");
const router = express.Router();

const { authentication, isAdmin } = require("../middlewares/authenticaton");
const {
  createBrand,
  updateBrand,
  getBrand,
  getAllBrands,
  deleteBrand,
} = require("../controllers/brand");

router.post("/createBrand", authentication, createBrand);
router.get("/getAllBrands", getAllBrands);
router.put("/:id", authentication, isAdmin, updateBrand);
router.get("/:id", getBrand);
router.delete("/:id", authentication, isAdmin, deleteBrand);

module.exports = router;
