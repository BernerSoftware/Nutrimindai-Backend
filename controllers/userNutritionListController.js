const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const UserNutritionList = require("./../models/userNutritionListModel");
const { currentUserByRequest } = require("./../utils/currentUser");
const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
});
const openai = new OpenAIApi(config);

exports.saveUserNutritionList = catchAsync(async (req, res, next) => {
  const user = await currentUserByRequest(req);
  const userId = user._id;

  const { dietList } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingListsCount = await UserNutritionList.countDocuments({
    userId,
    createdAt: { $gte: today },
  });

  if (process.env.NODE_ENV === "development") {
    console.log("continue");
  } else {
    if (existingListsCount >= 3) {
      return res.status(400).json({
        status: "error",
        message:
          "Please upgrade your package. You can add a maximum of 3 lists within a day.",
      });
    }
  }

  const userNutritionList = new UserNutritionList({
    userId: userId,
    dietList: dietList,
    listName: req.body.listName,
    currentTodayList: false,
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

  const id = req.params.id;

  const updatedList = await UserNutritionList.findOneAndUpdate(
    { _id: id, userId: userId },
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

exports.setCurrentTodayList = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  const user = await currentUserByRequest(req);
  const userId = user._id;

  const userNutritionLists = await UserNutritionList.find({ userId });

  let targetList;

  userNutritionLists.forEach((list) => {
    if (list._id.toString() === id) {
      targetList = list;
    } else {
      list.currentTodayList = false;
      list.save();
    }
  });

  if (!targetList) {
    return res.status(404).json({
      status: "error",
      message: "List not found.",
    });
  }

  targetList.currentTodayList = true;
  await targetList.save();

  res.status(200).json({
    status: "success",
    message: "The value of currentTodayList has been successfully updated.",
    data: targetList,
  });
});

exports.getCurrentTodayList = catchAsync(async (req, res, next) => {
  const user = await currentUserByRequest(req);
  const userId = user._id;

  const currentTodayList = await UserNutritionList.findOne({
    userId,
    currentTodayList: true,
  });

  if (!currentTodayList) {
    return res.status(404).json({
      status: "error",
      message: "No existing day list found.",
    });
  }

  let totalCalories = 0;
  currentTodayList.dietList.forEach((meal) => {
    meal.foods.forEach((food) => {
      totalCalories += food.totalCalories;
    });
  });

  currentTodayList.totalCalories = totalCalories;

  res.status(200).json({
    status: "success",
    data: { currentTodayList, totalCalories },
  });
});

exports.recipe = catchAsync(async (req, res, next) => {
  const { foodName } = req.body;

  const prompt = `${foodName} yemeğinin bana nasıl yapıldığını yazabilir misin. Çok kısa bir tarif ver. Projemde kullanacağım için standart bir JSON döndür. İngilizceye çevir.
     Örnek JSON FORMAT YAPISI:  Description içindeki bilgiler ingilizce yazılmalı.

     {
      "Description": "1 egg, 8 kilograms of flour, 5 teaspoons of oil"
     }`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 1000,
    temperature: 1,
  });

  const textResponse = response.data.choices[0].text.trim();

  const jsonText = textResponse.replace(/^([A-Za-z]+):\s/gm, '"$1": ');

  let responseData;
  try {
    responseData = JSON.parse(jsonText);
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Invalid JSON format.",
    });
  }

  res.status(200).json({
    status: "success",
    data: responseData,
  });
});
