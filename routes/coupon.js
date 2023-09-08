const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/coupon");
const { authentication, isAdmin } = require("../middlewares/authenticaton");

router.post("/createCoupon", authentication, isAdmin, createCoupon);
router.get("/getAllCoupons", authentication, isAdmin, getAllCoupons);
router.put("/:id", authentication, isAdmin, updateCoupon);
router.delete("/:id", authentication, isAdmin, deleteCoupon);

module.exports = router;
