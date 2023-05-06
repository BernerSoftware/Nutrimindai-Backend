const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: "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",
});

const openai = new OpenAIApi(config);

const runPrompt = async () => {
  const prompt = "Tell me a joke about a cat";
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt:prompt,
    max_tokens: 60,
    temperature: 1,
  });

  console.log(response.data.choices[0].text);
};

runPrompt();
