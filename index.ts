import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
config();

const { OPEN_AI_API_KEY } = process.env;
if (!OPEN_AI_API_KEY) {
  throw new Error("OPEN_AI_API_KEY is required.");
}

const configuration = new Configuration({
  apiKey: OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const prompt: ChatCompletionRequestMessage = {
  role: "user",
  content:
    "くらにゃんの住んでいる国の有名なイベントについて日本語で教えてください。",
};

const getLivingCountry = (userName: string) => {
  return userName === "くらにゃん" ? "日本" : "アメリカ";
};

const functions = {
  getLivingCountry,
} as const;

const res = await openai.createChatCompletion({
  model: "gpt-4-0613",
  messages: [prompt],
  function_call: "auto",
  functions: [
    {
      name: "getLivingCountry",
      description: "住んでいる国を取得",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "ユーザー名",
          },
        },
        required: ["name"],
      },
    },
  ],
});

const message = res.data.choices[0].message;
console.log("message", message);
const functionCall = message?.function_call;

if (functionCall) {
  const args = JSON.parse(functionCall.arguments || "{}");

  // @ts-ignore
  const functionRes = functions[functionCall.name!](args.name);

  // 関数の結果をもとに再度質問
  const res2 = await openai.createChatCompletion({
    model: "gpt-4-0613",
    messages: [
      prompt,
      message,
      {
        role: "function",
        content: functionRes,
        name: functionCall.name,
      },
    ],
  });
  console.log("answer", res2.data.choices[0].message);
}
