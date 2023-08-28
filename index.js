const express = require("express");
const app = express();
require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connect");
const authRouter = require("./routes/auth");
const productRouter = require("./routes/product");
const blogRouter = require("./routes/blog");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const morgan = require("morgan");

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/blog", blogRouter);

//error handlers
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.URI);
    app.listen(port, console.log(`server is running at port ${port}`));
  } catch (error) {
    throw new Error(error);
  }
};

start();
