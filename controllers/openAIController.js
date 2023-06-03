const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Configuration, OpenAIApi } = require("openai");
const flatted = require("flatted");

const config = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
});
const openai = new OpenAIApi(config);

exports.openai = catchAsync(async (req, res, next) => {
  const { age, gender, height, weight, targetWeight, allergies } = req.body;
  const prompt = `${age} yaşında ${gender}, ${height} boyunda, ${weight}  kilosunda, ${targetWeight} kilo olmak isteyen, Türkiyede yaşayan, Gluten intoleransı hastalığı olan bir birey için örnek bir diyet listesi hazırlamanı istiyorum. Diyet listesinin yapısı aynen şu şekilde olmalı: 
İstediğin kadar öğün olabilir. Alerjiler ise şöyledir = ${allergies}. Sadece Sabah,Öğle ve Akşam yemeği olsun 3 tane meal olsun.

Örnek JSON FORMAT Yapı: 

  {
          "dietList": [
        {
          "meal": "Breakfast",
          "foods": [
            {
              "foodName": "Egg",
              "totalCalories": 60,
              "description": "1 Medium-sized"
            },
            {
              "foodName": "Cheese",
              "totalCalories": 60,
              "description": "2 slices, Full-fat, small"
            }
          ]
        },
        {
          "meal": "Snack",
          "foods": [
            {
              "foodName": "Walnuts",
              "totalCalories": 60,
              "description": "1 Handful"
            },
            {
              "foodName": "Apple",
              "totalCalories": 60,
              "description": "1 Medium-sized"
            }
          ]
        }
      ]
    }

    Her Arrayde 2 tane obje olsun. Bu yapı dışında başka bir cevap yazma. Json formatında cevap ver. totalCalories alanı önemli. Doğru olsun lütfen. Sadece ama sadece json olarak cevap dön. Başka hiçbirşey ama hiçbirşey yazma. Sadece json. Bunu yazdım diye elbette, tabiki gibi cevaplarda verme. `;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 1500,
    temperature: 1,
  });

  const responseData = JSON.parse(response.data.choices[0].text);

  // // totalCalories hesapla
  // let totalCalories = 0;
  // responseData.dietList.forEach((meal) => {
  //   meal.foods.forEach((food) => {
  //     totalCalories += food.totalCalories;
  //   });
  // });

  // // totalCalories alanını responseData'ya ekle
  // responseData.totalCalories = totalCalories;

  res.status(200).json({
    status: "success",
    data: responseData,
  });
});
