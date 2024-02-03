import { WebSocketServer } from "ws";
import { insertData, getDataByTypeAndUserID } from "./src/service/DataBase.js";

import {
  handleQuery,
  uploadToPostgreSQLAndPinecone,
  floorFirst,
} from "./src/service/IntegratedServices.js";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
dotenv.config();
const implicit_memory = "user_implicit_memory";
const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", function connection(ws) {
  console.log("客户端已连接");

  ws.on("message", async function message(data) {
    /*  const parsedData = JSON.parse(data);
    // 提取变量
    const user_id = parsedData.user_id;
    const type = parsedData.type;
    const content = parsedData.content;
    const attitude = parsedData.attitude;
    const indexNamespace = "user_implicit_memory";
    await uploadToPostgreSQLAndPinecone(
      implicit_memory,
      user_id,
      type,
      content,
      attitude,
      indexNamespace,
    ); */
    const messageText = data.toString("utf8");
    const topK = 3;

    console.log("收到消息:", messageText);

    const dataFloorFirst = await floorFirst(messageText, topK);
    /* insertData(uuid, user_id, type, content, attitude); */
    // 根据接收到的消息做出响应，例如插入数据或查询数据
  });

  ws.send("连接成功");
});
