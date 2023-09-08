const Product = require("../models/product");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoId = require("../utils/validateMongoId");
const cloudinaryUploadImage = require("../utils/cloudinary");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const product = await Product.create(req.body);
    res.json({ product });
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.json({ product });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    // Filtering products
    let queryObject = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((item) => delete queryObject[item]);
    let numericQuery = JSON.stringify(queryObject);
    numericQuery = numericQuery.replace(
      /\b(gte|gt|lte|lt|eq)\b/g,
      (match) => `$${match}`
    );

    let result = Product.find(JSON.parse(numericQuery));

    //Sorting products
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      result = result.sort(sortBy);
    } else {
      result = result.sort("-createdAt");
    }

    //fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      result = result.select(fields);
    } else {
      result = result.select("-__v");
    }

    //pagination
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);
    if (req.query.page) {
      const productCount = await Product.countDocuments();
      if (skip >= productCount) throw new Error("This page does not exist");
    }

    const products = await result;
    res.json({ products, nbHits: products.length });
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.name) {
      req.body.slug = slugify(req.body.name);
    }
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({ product });
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.json({ msg: "product deleted" });
  } catch (error) {
    throw new Error(error);
  }
});

//Function to add and remove product from wishlist.
const addToWishList = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    //Checking if the product has already been added
    const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        _id,
        { $pull: { wishlist: prodId } },
        { new: true }
      );
      res.json({ user });
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        { $push: { wishlist: prodId } },
        { new: true }
      );
      res.json({ user });
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
      //update rating
      await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedBy: _id,
            },
          },
        },
        { new: true }
      );

      const getAllRatings = await Product.findById(prodId);
      let totalRating = getAllRatings.ratings.length;
      let ratingSum = getAllRatings.ratings
        .map((item) => item.star)
        .reduce((prev, curr) => prev + curr, 0);

      let actualRating = Math.round(ratingSum / totalRating);

      let product = await Product.findByIdAndUpdate(
        prodId,
        { totalRating: actualRating },
        { new: true }
      );
      res.json({ product });
    }
  } catch (error) {
    throw new Error(error);
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const uploader = (path) => cloudinaryUploadImage(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = files;
      const newPath = await uploader(path);
      urls.push(newPath);
    }
    const product = await Product.findByIdAndUpdate(
      id,
      {
        images: urls.map((file) => {
          return file;
        }),
      },
      { new: true }
    );
    res.json({ product });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  addToWishList,
  rating,
};
