import { useState } from "react";
import OpenAI from "openai";
import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";

export default function DatabaseManage() {
  const [text, setText] = useState("");

  const openai = new OpenAI({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
  });
  const pc = new Pinecone({
    apiKey: "34f2630b-2f0d-477f-a9ba-61503e5fccf0",
  });
  const pineconeIndexName = "long-term-memory";
  // 连接到Pinecone索引
  const index = pc.index(pineconeIndexName);
  const lm = index.namespace("user_long_term_memory");
  const im = index.namespace("user_implicit_memory");

  async function uploadTextVectorToPinecone(text) {
    const recordId = uuidv4();
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
      encoding_format: "float",
    });

    // 提取向量
    const vector = embeddingResponse.data[0].embedding;

    // 准备数据并上传到Pinecone
    const records = [
      {
        id: recordId, // 记录的唯一ID
        values: vector,
      },
    ];

    await lm.upsert(records);
    await im.upsert(records);
    console.log(`Vector for '${text}' uploaded successfully.`);
  }

  async function getQueryVector(question) {
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: question,
      encoding_format: "float",
    });

    return embeddingResponse.data[0].embedding;
  }

  async function queryPinecone(vector) {
    const queryResponse = await index.query({
      vector: vector,
      topK: 3, // 例如，返回最相似的前3个结果
    });

    return queryResponse.matches;
  }

  async function generateResponse(question) {
    const vector = await getQueryVector(question);
    const matches = await queryPinecone(vector);

    // 处理Pinecone查询结果
    if (matches.length > 0) {
      // 例如，使用第一个匹配的ID生成回复
      const response = `你提到的可能与我们记录中的 '${matches[0].id}' 相关。`;
      console.log(response);
    } else {
      console.log("抱歉，我没有找到与你的问题相关的答案。");
    }
  }
  // 示例使用
  //   uploadTextVectorToPinecone(
  //     "The quick brown fox jumped over the lazy dog",
  //     "your-pinecone-index-name",
  //     "example-id",
  //   );
  return (
    <div className="m-4 flex flex-col items-center justify-center">
      <h1>DatabaseManage</h1>
      <input
        className="border"
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={() => uploadTextVectorToPinecone(text)}>test</button>
    </div>
  );
}
