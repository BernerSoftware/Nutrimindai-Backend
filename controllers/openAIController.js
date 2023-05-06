const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Configuration, OpenAIApi } = require("openai");
const flatted = require("flatted");

const config = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(config);

exports.openai = catchAsync(async (req, res, next) => {
  const prompt = `23 yaşında Erkek, 1.72 boyunda, 74 kilosunda, 64 kilo olmak isteyen, Türkiyede yaşayan, Gluten intoleransı hastalığı olan bir birey için örnek bir diyet listesi hazırlamanı istiyorum. Diyet listesinin yapısı aynen şu şekilde olmalı: 
İstediğin kadar öğün olabilir. Bu yapı dışında başka bir cevap yazma. Json formatında cevap ver. totalCalories alanı önemli. Doğru olsun lütfen. Sadece ama sadece json olarak cevap dön. Başka hiçbirşey ama hiçbirşey yazma. Sadece json. Bunu yazdım diye elbette, tabiki gibi cevaplarda verme.`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 1000,
    temperature: 1,
  });

  // Use the `flatted` library to stringify the response object
  const responseData = JSON.parse(response.data.choices[0].text);
  res.status(200).json({
    status: "success",
    data: responseData,
  });
});
