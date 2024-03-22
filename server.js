import "global-agent/bootstrap.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { sendMail } from "./src/service/MailSend.js";
import {
  logUser,
  findUserExist,
  insertUser,
  getPostgreSQLDataByUUIDAndUserId,
  getDataByUserId,
  deleteDataFromPostgreSQL,
} from "./src/service/PostgreSQLDataBase.js";
import {
  createNewCollectionFromMilvus,
  searchVectorDataFromMilvus,
  deleteVectorDataFromCollectionFromMilvus,
} from "./src/service/MilvusVectorDatabase.js";
import { WebSocketServer } from "ws";

import {
  createZhipuAIByApiKey,
  createCompletionsByZhipuAI,
  summarizeByZhipuAI,
} from "./src/service/ZhipuAIService.js";
import {
  convertEmailToCollectionName,
  uploadToPostgreSQLAndMilvus,
  floorSecondByZhipuAI,
  floorThirdByZhipuAI,
} from "./src/service/IntegratedServices.js";

dotenv.config();

// 打印环境变量测试
console.log(process.env.PGUSER);

// 应用配置
const express_port = 3001;
const ws_port = 3002;
const app = express();
let randomCode = null; //存发出去的验证码
app.use(cors());
app.use(express.json());

// 创建 WebSocket 服务
const wss = new WebSocketServer({ port: ws_port });

//ZhipuAI流式输出业务逻辑
wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const {
      apiKey,
      user_id,
      question,
      topK,
      portrait,
      lastElements,
      userMessage,
    } = JSON.parse(message);
    const myAPI = createZhipuAIByApiKey(apiKey);
    const convertName = convertEmailToCollectionName(user_id);
    const collectionName = "long_term_memory_" + convertName;
    let messages = [];
    //业务流一
    try {
      const result = await myAPI.createEmbeddings({
        model: "embedding-2",
        input: question,
      });
      const embedding = result.data[0].embedding;
      const queryMilvusResult = await searchVectorDataFromMilvus(
        collectionName,
        embedding,
        topK,
      );
      console.log("这是queryMilvusResult：" + queryMilvusResult);
      const queryPostgresSQLresult = await Promise.all(
        queryMilvusResult.map(async (item) => {
          const data = await getPostgreSQLDataByUUIDAndUserId(item.id, user_id);
          // 可以选择存储原始对象的更多信息，或仅存储获取的数据
          return data.content;
        }),
      );
      console.log("这是queryPostgresSQLresult：" + queryPostgresSQLresult);
      messages = await floorSecondByZhipuAI(
        portrait,
        question,
        queryPostgresSQLresult,
        lastElements,
        userMessage,
      );
      console.log(messages);
    } catch (error) {
      console.error("Error with API:", error);
      ws.send(JSON.stringify({ error: error.message }));
    }
    //业务流二
    try {
      const data = await myAPI.createCompletions({
        model: "glm-4",
        messages: [{ role: messages.role, content: messages.content }],
        // 设置为 true 以获取流式输出
        stream: true,
      });

      let buffer = ""; // 用于存储不完整的数据块
      let allChunks = ""; //用于存储传输的文字
      // 监听 'data' 事件以逐步读取数据
      data.on("data", (chunk) => {
        // 将 chunk 转换为字符串
        const chunkString = chunk.toString();

        if (chunkString === "data: [DONE]") {
          const finishData = { allChunks: allChunks, finish: true };
          ws.send(JSON.stringify(finishData));
          console.log("数据流结束");
        }

        // 将本次数据块与之前的不完整数据块拼接
        const combinedChunk = buffer + chunkString;

        // 使用正则表达式匹配出所有 content 字段的值
        const contentMatches = combinedChunk.match(/"content":"(.*?)"/g);

        if (contentMatches) {
          for (const match of contentMatches) {
            // 提取 content 字段的值并输出
            const content = match.split('"')[3];
            allChunks += content;
            const responseData = { allChunks: allChunks, finish: false };
            ws.send(JSON.stringify(responseData));
            console.log(content);
          }
        }

        // 更新 buffer，存储剩余未处理的部分
        buffer = combinedChunk.split(
          contentMatches[contentMatches.length - 1],
        )[1];
        // 检查是否收到 "data: [DONE]"
      });

      // 监听 'end' 事件表示数据流已经结束
      data.on("end", () => {
        const finishData = { allChunks: allChunks, finish: true };
        ws.send(JSON.stringify(finishData));
        console.log("数据流结束");
      });

      // 监听 'error' 事件以处理任何错误
      data.on("error", (err) => {
        console.error("发生错误:", err);
      });

      //await floorThirdByZhipuAI(input, user_id, indexNamespace);
    } catch (error) {
      console.error("Error with API:", error);
      ws.send(JSON.stringify({ error: error.message }));
    }
    //业务流三
    try {
      const conclusionPrompt = await floorThirdByZhipuAI(question);
      const conclusion = await myAPI.createCompletions({
        model: "glm-4",
        messages: [{ role: "user", content: conclusionPrompt }],
        stream: false,
      });
      const result = conclusion.choices[0].message.content;
      console.log("这是收到的  " + result);

      //const quotedString = result.replace(/(\w+):/g, '"$1":').replace(/:([^,{}]+)/g, ':"$1"');
      const jsonArrayString = `[${result}]`;
      const waittingData = JSON.parse(jsonArrayString);
      console.log("这是处理后的  " + waittingData);
      waittingData.map(async (item) => {
        const type = item.type;
        const content = item.content;
        const attitude = item.attitude;
        await uploadToPostgreSQLAndMilvus(
          myAPI,
          user_id,
          type,
          content,
          attitude,
          collectionName,
        );
      });
      console.log("上传成功");
    } catch (error) {
      console.error("Error with API:", error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });
});

//旧版chatgpt的流式业务逻辑
/* wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const {
      user_id,
      question,
      topK,
      portrait,
      lastElements,
      userMessage,
      temperature,
    } = JSON.parse(message);
    const indexNamespace = "user_implicit_memory";
    const input = question; //给floorThird的
    try {
      const dataFloorFirst = await floorFirst(question, topK); //业务流一
      const completion = await floorSecond(
        portrait,
        question,
        dataFloorFirst,
        lastElements,
        userMessage,
        temperature,
      ); //业务流二

      let allChunks = "";
      for await (const chunk of completion) {
        const contentChunk = chunk.choices[0]?.delta?.content || "";
        allChunks += contentChunk;
        const responseData = { allChunks: allChunks, finish: false };
        ws.send(JSON.stringify(responseData));

        if (chunk.choices[0]?.finish_reason === "stop") {
          const finishData = { allChunks: allChunks, finish: true };
          ws.send(JSON.stringify(finishData));
          break;
        }
      }
      await floorThird(input, user_id, indexNamespace);
    } catch (error) {
      console.error("Error with OpenAI API:", error);
      ws.send(JSON.stringify({ error: error.message }));
    }
  });
}); */

app.post("/summarize", async (req, res) => {
  try {
    const { apiKey, finalHistory, createdTime } = req.body;
    console.log(finalHistory, createdTime);
    const myAPI = createZhipuAIByApiKey(apiKey);
    const sum = await summarizeByZhipuAI(myAPI, finalHistory, createdTime);
    res.send(sum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/log", async (req, res) => {
  //点击登录
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const { status, isLog } = await logUser(email, password);
    if (isLog) {
      // Token密钥，应该保存在环境变量中，不要直接硬编码在代码中

      res.json({ status, isLog });
    } else {
      res.json({ status, isLog });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/sendCode", async (req, res) => {
  //点击发送验证码
  try {
    const { email } = req.body;
    console.log(email);
    //判断是否存在该邮箱，若存在则返回已注册
    const isExist = await findUserExist(email);
    if (isExist) {
      const status = "该邮箱已注册";
      res.json({ status });
    } else {
      randomCode = Math.floor(Math.random() * 900000) + 100000;
      const status = await sendMail(email, randomCode);
      res.json({ status }); // 以JSON格式发送状态
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/register", async (req, res) => {
  //点击注册
  try {
    const { email, password, code } = req.body;
    console.log(email, password, code);
    if (randomCode === Number(code)) {
      const isRegister = insertUser(email, password);
      if (isRegister) {
        const status = "注册成功";
        const convertName = convertEmailToCollectionName(email);
        const collectionName = "long_term_memory_" + convertName;
        await createNewCollectionFromMilvus(collectionName);
        res.json({ status });
      } else {
        const status = "注册失败";
        res.json({ status });
      }
    } else {
      const status = "验证码错误";
      res.json({ status });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/returnList", async (req, res) => {
  //点击发送验证码
  try {
    const { user_id } = req.body;
    const data = await getDataByUserId(user_id);
    console.log(data);
    res.json({ data }); // 以JSON格式发送状态
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/update", async (req, res) => {
  //点击发送验证码
  try {
    const { apiKey, user_id, uuid, type, content, attitude } = req.body;
    //所有数据传过来，重新更新
    const myAPI = createZhipuAIByApiKey(apiKey);
    const convertName = convertEmailToCollectionName(user_id);
    const collectionName = "long_term_memory_" + convertName;
    await deleteVectorDataFromCollectionFromMilvus(collectionName, uuid);
    await deleteDataFromPostgreSQL(uuid, user_id);

    const status = await uploadToPostgreSQLAndMilvus(
      myAPI,
      user_id,
      type,
      content,
      attitude,
      collectionName,
    );

    res.json({ status }); // 以JSON格式发送状态
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/deleteLongTerm", async (req, res) => {
  //点击发送验证码
  try {
    const { user_id, uuid } = req.body;
    const convertName = convertEmailToCollectionName(user_id);
    const collectionName = "long_term_memory_" + convertName;
    await deleteVectorDataFromCollectionFromMilvus(collectionName, uuid);
    await deleteDataFromPostgreSQL(uuid, user_id);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/testWork", async (req, res) => {
  //点击发送验证码
  try {
    const { apiKey } = req.body;
    //所有数据传过来，重新更新
    const myAPI = createZhipuAIByApiKey(apiKey);
    const text = "你好";
    const status = await createCompletionsByZhipuAI(myAPI, text);
    if (status) {
      res.json({ status });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// 启动服务器
app.listen(express_port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${express_port}`);
});
