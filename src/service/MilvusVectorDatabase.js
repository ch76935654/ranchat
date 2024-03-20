import dotenv from "dotenv";
import { MilvusClient } from "@zilliz/milvus2-sdk-node";
import { DataType } from "@zilliz/milvus2-sdk-node";

dotenv.config();

const address = "localhost:19530";
const token = "root:Milvus";
const ssl = false;
//连接向量数据库
const milvusClient = new MilvusClient({ address, ssl, token });

//创建新向量集合
async function createNewCollectionFromMilvus(collectionName) {
  await milvusClient.createCollection({
    collection_name: collectionName,
    fields: [
      {
        name: "id",
        data_type: DataType.VarChar,
        max_length: 36,
        is_primary_key: true,
      },
      {
        name: "embedding",
        data_type: DataType.FloatVector,
        dim: 1024,
      },
    ],
    enableDynamicField: true,
  });
  //创建索引
  const index_params = {
    metric_type: "L2",
    index_type: "IVF_FLAT",
    params: JSON.stringify({ nlist: 1024 }),
  };
  await milvusClient.createIndex({
    collection_name: collectionName,
    index_name: "embedding",
    field_name: "embedding",
    extra_params: index_params,
  });
}

//插入向量数据
async function insertVectorDataFromMilvus(collectionName, uuid, embedding) {
  const r = await milvusClient.insert({
    collection_name: collectionName,
    fields_data: [{ id: uuid, embedding: embedding }],
  });
  console.log(r);
  await milvusClient.flushSync({
    collection_names: [collectionName],
  });
}

//搜索向量数据，并返回最近似的topK个
async function searchVectorDataFromMilvus(collectionName, embedding, topK) {
  await milvusClient.loadCollection({
    collection_name: collectionName,
  });
  const results = await milvusClient.search({
    collection_name: collectionName,
    vector: embedding,
    limit: topK,
  });
  await milvusClient.releaseCollection({ collection_name: collectionName });
  return results.results;
}
//await milvusClient.closeConnection();

//删除向量数据
async function deleteVectorDataFromCollectionFromMilvus(collectionName, uuid) {
  await milvusClient.deleteEntities({
    collection_name: collectionName,
    expr: `id in ["${uuid}"]`,
  });
}

export {
  createNewCollectionFromMilvus,
  insertVectorDataFromMilvus,
  searchVectorDataFromMilvus,
  deleteVectorDataFromCollectionFromMilvus,
};
