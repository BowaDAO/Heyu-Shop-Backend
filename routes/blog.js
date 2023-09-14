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
  uploadImages,
} = require("../controllers/blog");
const { uploadPhoto, blogImageResize } = require("../middlewares/uploadImages");

router.post("/createBlog", authentication, createBlog);
router.put(
  "/upload/:id",
  authentication,
  isAdmin,
  uploadPhoto.array("images", 2),
  blogImageResize,
  uploadImages
);
router.get("/getAllBlogs", getAllBlogs);
router.put("/like", authentication, likeBlog);
router.put("/dislike", authentication, dislikeBlog);
router.put("/:id", authentication, isAdmin, updateBlog);
router.get("/:id", getBlog);
router.delete("/:id", authentication, isAdmin, deleteBlog);

module.exports = router;
