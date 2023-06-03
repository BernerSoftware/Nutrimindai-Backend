const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Configuration, OpenAIApi } = require("openai");
const flatted = require("flatted");

const config = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(config);

exports.openai = catchAsync(async (req, res, next) => {
  const { age, gender, height, weight, targetWeight, allergies } = req.body;
  const prompt = `${age} yaşında ${gender}, ${height} boyunda, ${weight}  kilosunda, ${targetWeight} kilo olmak isteyen, Türkiyede yaşayan, Gluten intoleransı hastalığı olan bir birey için örnek bir diyet listesi hazırlamanı istiyorum. Diyet listesinin yapısı aynen şu şekilde olmalı: 
İstediğin kadar öğün olabilir. Alerjiler ise şöyledir = ${allergies}. Sadece Sabah,Öğle ve Akşam yemeği olsun.

Örnek JSON FORMAT Yapı: 

{
        "dietList":
        [
            {
               "meal":"Sabah Kahvaltısı",
               "foods":[
                {"foodName":"Yumurta","totalCalories":60, "description":"1 Adet Orta Boy"},
                {"foodName":"Peynir","totalCalories":60,"description":"2 dilim, Tam yağlı, küçük"}
               ]
            },
            {
               "meal":"Ara Öğün",
               "foods":[
                {"foodName":"Ceviz","totalCalories":60,"description":"1 Avuç"},
                {"foodName":"Elma","totalCalories":60,"description":"1 Adet Orta Boy"}
               ]
            }
        ],
    }

Bu yapı dışında başka bir cevap yazma. Json formatında cevap ver. totalCalories alanı önemli. Doğru olsun lütfen. Sadece ama sadece json olarak cevap dön. Başka hiçbirşey ama hiçbirşey yazma. Sadece json. Bunu yazdım diye elbette, tabiki gibi cevaplarda verme.`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 1000,
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
