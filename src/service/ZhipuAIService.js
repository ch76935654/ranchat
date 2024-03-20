import dotenv from "dotenv";
import { ZhipuAI } from "zhipuai-sdk-nodejs-v4";

dotenv.config();

const ai = new ZhipuAI({
  apiKey: process.env.ZHIPUAI_API_KEY,
});

async function createEmbeddingsByZhipuAI(question) {
  const result = await ai.createEmbeddings({
    model: "embedding-2",
    input: question,
  });
  const embedding = result.data[0].embedding;
  console.log(embedding, "embedding");
  return embedding;
}

// 图像生成
async function createIamgeByZhipuAI() {
  const result = await ai.createImages({
    model: "cogview-3",
    prompt: "粉紫色的聊天界面",
  });
  console.log(result.data, "image url list");
}

//文本生成
async function createCompletionsByZhipuAI(message) {
  const data = await ai.createCompletions({
    model: "glm-4",
    messages: message,
    stream: false,
  });
  const result = data.choices[0].message.content;
  console.log(result, "message");
  return result;
}

async function createStreamCompletionsByZhipuAI(userMessage, temperature) {
  const data = await ai.createCompletions({
    model: "glm-4",
    messages: [{ role: userMessage.role, content: userMessage.content }],
    temperature: Number(temperature || 0.95),
    stream: true,
  });
  return data;
}

async function summarizeByZhipuAI(finalHistory, createdTime) {
  const result = finalHistory.map((h) => ({
    role: h.role,
    content: h.content,
  }));
  const date = new Date(Number(createdTime));
  try {
    const completion = await ai.createCompletions({
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
  ai,
  createStreamCompletionsByZhipuAI,
  createCompletionsByZhipuAI,
  summarizeByZhipuAI,
  createIamgeByZhipuAI,
  createEmbeddingsByZhipuAI,
};
