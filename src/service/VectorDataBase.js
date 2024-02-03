import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// 连接到Pinecone索引
const pineconeIndex = pc.index("long-term-memory");
const lm = pineconeIndex.namespace("user_long_term_memory");
const im = pineconeIndex.namespace("user_implicit_memory");

async function uploadTextVectorToPinecone(uuid, text) {
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
      id: uuid, // 记录的唯一ID
      values: vector,
    },
  ];

  await lm.upsert(records);

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

async function queryPinecone(vector, topK) {
  try {
    const queryResponse = await im.query({
      vector: vector,
      topK: topK, // 例如，返回最相似的前3个结果
    });
    return queryResponse.matches;
  } catch (error) {
    console.log(error);
  }
}

async function returnPineconeQueryResult(vector, topK) {
  const matches = await queryPinecone(vector, topK);

  // 处理Pinecone查询结果
  if (matches.length > 0) {
    // 例如，使用第一个匹配的ID生成回复
    const response = `你提到的可能与我们记录中的 '${matches[0].id}' 相关。`;
    console.log(response);
  } else {
    console.log("抱歉，我没有找到与你的问题相关的答案。");
  }
}

export {
  pineconeIndex,
  queryPinecone,
  uploadTextVectorToPinecone,
  returnPineconeQueryResult,
};
