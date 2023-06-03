const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const openAIRouter = require("./routes/openAIRoutes");
const userNutritionListRouter = require("./routes/userNutritionListRoutes");

var bodyParser = require("body-parser");

const app = express();

app.enable("trust proxy");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(cors());

app.options("*", cors());

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// Development logging
if (process.env.NODE_ENV.trim() === "development") {
  app.use(morgan("dev"));
}

if (process.env.NODE_ENV.trim() === "production") {
  console.log("prod");
}

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(express.raw());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Body parser, reading data from body into req.body
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use(mongoSanitize());

app.use(xss());

app.use(compression());

app.use(express.static(`${__dirname}/public`));

app.use("/api/v1/users", userRouter);
app.use("/api/v1/openai", openAIRouter);
app.use("/api/v1/nutritionList", userNutritionListRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
