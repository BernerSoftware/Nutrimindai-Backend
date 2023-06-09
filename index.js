const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(config);

const runPrompt = async () => {
  const prompt = `23 yaşında Erkek, 1.72 boyunda, 74 kilosunda, 64 kilo olmak isteyen, Türkiyede yaşayan, Gluten intoleransı hastalığı olan bir birey için örnek bir diyet listesi hazırlamanı istiyorum. Diyet listesinin yapısı aynen şu şekilde olmalı: 



İstediğin kadar öğün olabilir. Bu yapı dışında başka bir cevap yazma. Json formatında cevap ver. totalCalories alanı önemli. Doğru olsun lütfen. Sadece ama sadece json olarak cevap dön. Başka hiçbirşey ama hiçbirşey yazma. Sadece json. Bunu yazdım diye elbette, tabiki gibi cevaplarda verme.`;

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 1000,
    temperature: 1,
  });

  console.log(response.data.choices[0].text);
};

runPrompt();
