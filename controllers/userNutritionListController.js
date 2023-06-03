const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const UserNutritionList = require("./../models/userNutritionListModel");
const { currentUserByRequest } = require("./../utils/currentUser");

exports.saveUserNutritionList = catchAsync(async (req, res, next) => {
  const user = await currentUserByRequest(req);
  const userId = user._id;

  const { dietList } = req.body;

  const userNutritionList = new UserNutritionList({
    userId: userId,
    dietList: dietList,
    listName: req.body.listName,
  });

  await userNutritionList.save();

  res.status(200).json({
    status: "success",
    data: userNutritionList,
  });
});

exports.getUserNutritionLists = catchAsync(async (req, res, next) => {
  const user = await currentUserByRequest(req);
  const userId = user._id;

  const nutritionLists = await UserNutritionList.find({ userId });

  res.status(200).json({
    status: "success",
    data: nutritionLists,
  });
});

exports.updateUserNutritionList = catchAsync(async (req, res, next) => {
  const user = await currentUserByRequest(req);
  const userId = user._id;

  const { dietList } = req.body;

  const listId = req.params.id;

  const updatedList = await UserNutritionList.findOneAndUpdate(
    { _id: listId, userId: userId },
    { dietList: dietList },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    data: updatedList,
  });
});

exports.toggleFoodCheck = catchAsync(async (req, res, next) => {
  const user = await currentUserByRequest(req);
  const userId = user._id;

  const { id } = req.params;
  const { foodIds } = req.body;

  const userNutritionList = await UserNutritionList.findOne({
    _id: id,
    userId: userId,
  });

  userNutritionList.dietList.forEach((meal) => {
    meal.foods.forEach((food) => {
      if (foodIds.includes(food._id.toString())) {
        food.isChecked = !food.isChecked;
      }
    });
  });

  await userNutritionList.save();

  res.status(200).json({
    status: "success",
    data: userNutritionList,
  });
});
