import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pc = new Pinecone({
  apiKey: process.env.PINECONEKEY,
  //apiKey: "34f2630b-2f0d-477f-a9ba-61503e5fccf0",
});

// 连接到Pinecone索引
const pineconeIndex = pc.index("long-term-memory");

const im = pineconeIndex.namespace("user_implicit_memory");
const lm = pineconeIndex.namespace("user_long_term_memory");

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

async function fetchPineconeVectorByUUIDFromImplicit(uuid) {
  const fetchResult = await im.fetch([uuid]);
  const vector = fetchResult.records[uuid].values;
  console.log("成功获取" + uuid + "的向量");
  return vector;
}

async function deleteDataFromPineconeImplicit(uuid) {
  try {
    await im.deleteOne(uuid);
    console.log("成功删除数据" + uuid);
  } catch (error) {
    console.log(error);
  }
}

async function deleteDataFromPineconeLongTerm(uuid) {
  try {
    await lm.deleteOne(uuid);
    console.log("成功删除数据" + uuid);
  } catch (error) {
    console.log(error);
  }
}

export {
  pineconeIndex,
  queryPinecone,
  returnPineconeQueryResult,
  fetchPineconeVectorByUUIDFromImplicit,
  deleteDataFromPineconeImplicit,
  deleteDataFromPineconeLongTerm,
};
