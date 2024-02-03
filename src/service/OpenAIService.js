import OpenAI from "openai";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function chat(prompt) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return completion.choices[0]?.message.content.replace(/"/g, "");
  } catch (error) {
    console.error("Error with the summarize:", error);
  }
}

async function chatByStream(lastElements, userMessage, temperature) {
  // OpenAI API 调用
  return await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [...lastElements, userMessage].map((h) => ({
      role: h.role,
      content: h.content,
    })),
    temperature: Number(temperature || 1),
    stream: true,
  });
}

async function summarize(finalHistory, createdTime) {
  const result = finalHistory.map((h) => ({
    role: h.role,
    content: h.content,
  }));
  const date = new Date(Number(createdTime));
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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

async function embeddingChat(question) {
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: question,
    encoding_format: "float",
  });

  // 提取向量
  return embeddingResponse.data[0].embedding;
}

export { chat, chatByStream, summarize, embeddingChat };
