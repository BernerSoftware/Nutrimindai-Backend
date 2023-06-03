const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const UserNutritionList = require("./../models/userNutritionListModel");
const { currentUserByRequest } = require("./../utils/currentUser");
const { Configuration, OpenAIApi } = require("openai");
const config = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(config);

exports.saveUserNutritionList = catchAsync(async (req, res, next) => {
  const user = await currentUserByRequest(req);
  const userId = user._id;

  const { dietList } = req.body;

  // Tarih kontrolü için bugünün tarihini al
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Saat, dakika, saniye ve milisaniyeyi sıfırla

  // Bugün için eklenmiş kayıtları bul
  const existingListsCount = await UserNutritionList.countDocuments({
    userId,
    createdAt: { $gte: today },
  });

  // Eğer bugün için 3 kayıt varsa hata döndür
  if (existingListsCount >= 3) {
    return res.status(400).json({
      status: "error",
      message:
        "Lütfen paketinizi yükseltin. Gün içerisinde En fazla 3 tane liste ekleyebilirsiniz. İyi günler!",
    });
  }

  const userNutritionList = new UserNutritionList({
    userId: userId,
    dietList: dietList,
    listName: req.body.listName,
    currentTodayList: true,
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
  const { id } = req.params;

  const user = await currentUserByRequest(req);
  const userId = user._id;

  const userNutritionLists = await UserNutritionList.find({ userId });

  const toggleCurrentTodayList = (list) => {
    if (list.currentTodayList) {
      list.currentTodayList = false;
    } else {
      list.currentTodayList = true;
    }
  };

  let hasTrueValue = false;

  userNutritionLists.forEach((list) => {
    if (list._id.toString() !== id && list.currentTodayList) {
      hasTrueValue = true;
    }
  });

  if (hasTrueValue) {
    return res.status(400).json({
      status: "error",
      message:
        "Başka bir listenin currentTodayList değeri zaten true olarak ayarlı.",
    });
  }

  const nutritionList = await UserNutritionList.findById(id);
  toggleCurrentTodayList(nutritionList);

  await nutritionList.save();

  res.status(200).json({
    status: "success",
    data: nutritionList,
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
      message: "Mevcut bir günlük liste bulunamadı.",
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

  const prompt = `${foodName} yemeğinin bana nasıl yapıldığını yazabilir misin. Çok kısa bir tarif ver. Projemde kullanacağım için standart bir JSON döndür. 
     Örnek JSON FORMAT YAPISI:  

     { 
      "Description": "1 adet yumurta, 8 kilo un, 5 çay kaşığı yağ" 
     } `;

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
      message: "Geçersiz JSON formatı",
    });
  }

  res.status(200).json({
    status: "success",
    data: responseData,
  });
});
