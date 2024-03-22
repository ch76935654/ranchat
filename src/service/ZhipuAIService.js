import dotenv from "dotenv";
import { ZhipuAI } from "zhipuai-sdk-nodejs-v4";

dotenv.config();

function createZhipuAIByApiKey(Key) {
  return new ZhipuAI({
    apiKey: Key,
  });
}

async function createEmbeddingsByZhipuAI(myAPI, question) {
  const result = await myAPI.createEmbeddings({
    model: "embedding-2",
    input: question,
  });
  const embedding = result.data[0].embedding;
  console.log(embedding, "embedding");
  return embedding;
}

// 图像生成
async function createIamgeByZhipuAI(myAPI, question) {
  const result = await myAPI.createImages({
    model: "cogview-3",
    prompt: question,
  });
  console.log(result.data, "image url list");
}

//文本生成
async function createCompletionsByZhipuAI(myAPI, text) {
  const data = await myAPI.createCompletions({
    model: "glm-4",
    messages: [{ role: "user", content: text }],
    stream: false,
  });
  const result = data.choices[0].message.content;
  console.log(result, "message");
  return result;
}

async function createStreamCompletionsByZhipuAI(myAPI, userMessage) {
  const data = await myAPI.createCompletions({
    model: "glm-4",
    messages: [{ role: userMessage.role, content: userMessage.content }],
    stream: true,
  });
  return data;
}

async function summarizeByZhipuAI(myAPI, finalHistory, createdTime) {
  const result = finalHistory.map((h) => ({
    role: h.role,
    content: h.content,
  }));
  const date = new Date(Number(createdTime));
  try {
    const completion = await myAPI.createCompletions({
      model: "glm-4",
      messages: [
        ...result,
        {
          role: "user",
          content:
            "请为我用10个字以下的语言概括上面的聊天内容作为本次聊天的标题",
        },
      ],
    });
    console.log(completion.choices[0]?.message.content.replace(/"/g, ""));
    return {
      name: completion.choices[0]?.message.content.replace(/"/g, ""),
      dateString: date.toISOString(),
    };
  } catch (error) {
    console.error("Error with the summarize:", error);
  }
}

export {
  createZhipuAIByApiKey,
  createStreamCompletionsByZhipuAI,
  createCompletionsByZhipuAI,
  summarizeByZhipuAI,
  createIamgeByZhipuAI,
  createEmbeddingsByZhipuAI,
};
