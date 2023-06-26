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
  content: "こんにちは。今日はいい天気ですね。",
};

const res = await openai.createChatCompletion({
  model: "gpt-4-0613",
  messages: [prompt],
  function_call: "auto",
  functions: [
    {
      name: "generateTextMessage",
      description: "LINE Messaging APIのテキストメッセージを生成します。",
      parameters: {
        type: "object",
        properties: {
          type: {
            type: "string",
            description: "タイプ。値は`text`固定。",
          },
          text: {
            type: "string",
            description: "ChatGPTが生成したテキスト",
          },
        },
        required: ["type", "text"],
      },
    },
  ],
});

const message = res.data.choices[0].message;
// console.log("message", message);

const textMessage = JSON.parse(message.function_call?.arguments);
console.log("textMessage", textMessage);