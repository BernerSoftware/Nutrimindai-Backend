const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Configuration, OpenAIApi } = require("openai");
const flatted = require("flatted");

const config = new Configuration({
  apiKey: process.env.OPEN_AI_SECRET_KEY,
});
const openai = new OpenAIApi(config);

const handleAllergiesAndIntolerances = (allergies) => {
  if (allergies) {
    return `, has allergies to these: ${allergies}`;
  }
  return "";
};

exports.openai = catchAsync(async (req, res, next) => {
  const { age, gender, height, weight, targetWeight, allergies } = req.body;
  const prompt = `${age} yaşında ${gender}, ${height} boyunda, ${weight}  kilosunda, ${targetWeight} kilo olmak isteyen, Türkiye'de yaşayan. Diyet listesinin yapısı aynen şu şekilde olmalı: İstediğin kadar öğün olabilir. Alerjiler ise şöyledir = ${allergies}. Sadece Sabah, Öğle ve Akşam yemeği olsun 3 tane meal olsun.\n\nÖrnek JSON FORMAT Yapı:\n\n{\n  "dietList": [\n    {\n      "meal": "Breakfast",\n      "foods": [\n        {\n          "foodName": "Egg",\n          "totalCalories": 60,\n          "description": "1 Medium-sized"\n        },\n        {\n          "foodName": "Cheese",\n          "totalCalories": 60,\n          "description": "2 slices, Full-fat, small"\n        }\n      ]\n    },\n    {\n      "meal": "Snack",\n      "foods": [\n        {\n          "foodName": "Walnuts",\n          "totalCalories": 60,\n          "description": "1 Handful"\n        },\n        {\n          "foodName": "Apple",\n          "totalCalories": 60,\n          "description": "1 Medium-sized"\n        }\n      ]\n    }\n  ]\n}\n\nHer Arrayde 2 tane obje olsun. Bu yapı dışında başka bir cevap yazma. Json formatında cevap ver. totalCalories alanı önemli. Doğru olsun lütfen. Sadece ama sadece json olarak cevap dön. Başka hiçbirşey ama hiçbirşey yazma. Sadece json. Bunu yazdım diye elbette, tabiki gibi cevaplarda verme. `;

  const promptNew = `I want to prepare an example diet list for a person who is ${age} years old ${gender}, height of ${height} cm, ${weight} kg weights,
   wants to be ${targetWeight} kg${handleAllergiesAndIntolerances(
    allergies
  )}. Structure of diet list should be exactly like this: 
   {"totalCaloriesThatNeedsToBeTaken":1800,"dietList":[{"meal":"Brakfast","foods":[{"foodName":"Egg","totalCalories":60, "description":"1 Piece Medium Size"},{"foodName":"Cheese","totalCalories":60,"description":"2 slices, Full fat, small"}]},{"meal":"Ara Öğün","foods":[{"foodName":"Almond","totalCalories":60,"description":"1 handful"},{"foodName":"Apple","totalCalories":60,"description":"1 Piece Medium Size"}]}]}
  
   totalCaloriesThatNeedsToBeTaken field should be calculated according to the person's information like weight, aim weight etc. 
   But calculate this in background and then change totalCaloriesThatNeedsToBeTaken field according to your calculation. I don't want to see it in your response.
    You can create as many meals as you like. Don't write anything except for this structure. totalCalories is important and should be true and exact.
    For example you should first calculate the total calory the person needs to take. After that you make sure that when we add totalCalories fields it must add up to
     calories you first calculate. Do not write new line since I want more characters with no blank space.
  `;
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: promptNew,
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
      message: "Valid JSON response could not be obtained.",
    });
    return;
  }
});
