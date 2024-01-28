const mongoose = require("mongoose");

const validateMongoId = (id) => {
  const valid = mongoose.Types.ObjectId.isValid(id);
  if (!valid) {
    throw new Error("This is not a valid id");
  }
};

module.exports = validateMongoId;
