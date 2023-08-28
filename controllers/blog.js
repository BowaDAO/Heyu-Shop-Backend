const Blog = require("../models/blog");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongoId");

const createBlog = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.json({ blog });
  } catch (error) {
    throw new Error(error);
  }
});
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const blog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ blog });
  } catch (error) {
    throw new Error(error);
  }
});

const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const blog = await Blog.findById(id)
      .populate("likes")
      .populates("dislikes");
    await Blog.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true });
    res.json({ blog });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const blog = await Blog.find();
    res.json({ blog });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    await Blog.findByIdAndDelete(id);
    res.json({ message: "Blog deleted" });
  } catch (error) {
    throw new Error(error);
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoId(blogId);
  const blog = await Blog.findById(blogId);
  //Finding the current user via id
  const loginUserId = req?.user?._id;

  const isLiked = blog?.isLiked;
  //checking if the user has disliked the blog before
  const disliked = blog?.dislikes?.find(
    (userId) => userId?.toString() === loginUserId.toString()
  );
  if (disliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { dislikes: loginUserId },
        isDisliked: false,
      },
      { new: true }
    );
    res.json({ blog });
  }
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { likes: loginUserId }, isLiked: false },
      { new: true }
    );
    res.json({ blog });
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { likes: loginUserId }, isLiked: true },
      { new: true }
    );
    res.json({ blog });
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.body;
  validateMongoId(blogId);
  const blog = await Blog.findById(blogId);
  //Finding the current user via id
  const loginUserId = req?.user?._id;

  const isDisliked = blog?.isDisliked;
  //checking if the user has liked the blog before
  const liked = blog?.likes?.find(
    (userId) => userId?.toString() === loginUserId.toString()
  );
  if (liked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        $pull: { likes: loginUserId },
        isLiked: false,
      },
      { new: true }
    );
    res.json({ blog });
  }
  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $pull: { dislikes: loginUserId }, isDisliked: false },
      { new: true }
    );
    res.json({ blog });
  } else {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $push: { dislikes: loginUserId }, isDisliked: true },
      { new: true }
    );
    res.json({ blog });
  }
});

module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog,
};
