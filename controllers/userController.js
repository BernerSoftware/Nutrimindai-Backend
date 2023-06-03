const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const EmailVerificationToken = require("../../models/user/emailVerificationTokenModel");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("./../../utils/appError");
const User = require("../../models/user/userModel");

exports.getUser = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id.sub);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};
