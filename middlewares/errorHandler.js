const errorHandler = (error, req, res, next) => {
  const statusCode = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: error?.message,
    stack: error?.stack,
  });
};

module.exports = errorHandler;
