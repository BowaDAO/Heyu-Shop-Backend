const express = require("express");
const router = express.Router();

const { authentication, isAdmin } = require("../middlewares/authenticaton");
const {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
} = require("../controllers/blog");

router.post("/createBlog", authentication, createBlog);
router.get("/getAllBlogs", getAllBlogs);
router.put("/like", authentication, likeBlog);
router.put("/dislike", authentication, dislikeBlog);
router.put("/:id", authentication, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.delete("/:id", authentication, isAdmin, deleteBlog);

module.exports = router;
