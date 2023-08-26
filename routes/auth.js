const express = require("express");
const router = express.Router();

//Controllers
const {
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
} = require("../controllers/user");
const { authentication, isAdmin } = require("../middlewares/authenticaton");

router.post("/createUser", createUser);
router.post("/forgotPasswordToken", forgotPasswordToken);
router.put("/password", authentication, updatePassword);
router.put("/resetPassword/:token", resetPassword);
router.post("/login", loginUser);
router.get("/allUsers", getAllUsers);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/:id", authentication, getUser);
router.delete("/:id", authentication, deleteUser);
router.put("/:id", authentication, updateUser);
router.put("/blockUser/:id", authentication, isAdmin, blockUser);
router.put("/unblockUser/:id", authentication, isAdmin, unblockUser);

module.exports = router;
