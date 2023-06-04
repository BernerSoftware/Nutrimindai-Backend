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
  const prompt = `${age} yaşında ${gender}, ${height} boyunda, ${weight}  kilosunda, ${targetWeight} kilo olmak isteyen, Türkiye'de yaşayan. Diyet listesinin yapısı aynen şu şekilde olmalı: İstediğin kadar öğün olabilir. Alerjiler ise şöyledir = ${allergies}. Sadece Sabah, Öğle ve Akşam yemeği olsun 3 tane meal olsun.\n\nÖrnek JSON FORMAT Yapı:\n\n{\n  "dietList": [\n    {\n      "meal": "Breakfast",\n      "foods": [\n        {\n          "foodName": "Egg",\n          "totalCalories": 60,\n          "description": "1 Medium-sized"\n        },\n        {\n          "foodName": "Cheese",\n          "totalCalories": 60,\n          "description": "2 slices, Full-fat, small"\n        }\n      ]\n    },\n    {\n      "meal": "Snack",\n      "foods": [\n        {\n          "foodName": "Walnuts",\n          "totalCalories": 60,\n          "description": "1 Handful"\n        },\n        {\n          "foodName": "Apple",\n          "totalCalories": 60,\n          "description": "1 Medium-sized"\n        }\n      ]\n    }\n  ]\n}\n\nHer Arrayde 2 tane obje olsun. Bu yapı dışında başka bir cevap yazma. Json formatında cevap ver. totalCalories alanı önemli. Doğru olsun lütfen. Sadece ama sadece json olarak cevap dön. Başka hiçbirşey ama hiçbirşey yazma. Sadece json. Bunu yazdım diye elbette, tabiki gibi cevaplarda verme. `;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 3000,
    temperature: 1,
  });

  const responseText = response.data.choices[0].text;

  console.log(responseText);

  let responseData;
  try {
    responseData = JSON.parse(responseText);
    res.status(200).json({
      status: "success",
      data: responseData,
    });
  } catch (error) {
    // JSON çözümlenemedi, hatalı yanıtı ele al
    console.error("Hatalı yanıt: ", responseText);
    res.status(400).json({
      status: "error",
      message: "Geçerli bir JSON yanıtı alınamadı.",
    });
    return;
  }
});
