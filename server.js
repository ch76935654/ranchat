import "global-agent/bootstrap.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import { Pinecone } from "@pinecone-database/pinecone";
import { WebSocketServer } from "ws";
import { chatByStream, summarize } from "./src/service/OpenAIService.js";
import {
  uploadToPostgreSQLAndPinecone,
  floorFirst,
  floorSecond,
  floorThird,
} from "./src/service/IntegratedServices.js";
dotenv.config();

// 打印环境变量测试
console.log(process.env.PGUSER);

// 应用配置
const express_port = 3001;
const ws_port = 3002;
const app = express();
app.use(cors());
app.use(express.json());

// 创建 WebSocket 服务
const wss = new WebSocketServer({ port: ws_port });

wss.on("connection", (ws) => {
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
});

app.post("/summarize", async (req, res) => {
  try {
    const { finalHistory, createdTime } = req.body;
    console.log(finalHistory, createdTime);
    const sum = await summarize(finalHistory, createdTime);
    res.send(sum);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
// 启动服务器
app.listen(express_port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${express_port}`);
});

/* 
以下是注释掉的部分，如果需要使用，请取消注释并根据您的实际配置进行调整。

// 邮件发送配置
const transporter = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: 'your-email@qq.com',
    pass: 'your-password',
  },
});

app.post('/sendMail', (req, res) => {
  const { to } = req.body;
  const receiver = {
    from: '"Sender Name"<your-email@qq.com>',
    subject: '验证码',
    to: to,
    html: `
      <h1>你好，你的验证码：</h1>
      <h1 style="color:red">123456</h1>
    `,
  };

  transporter.sendMail(receiver, (error, info) => {
    if (error) {
      return res.status(500).json({ error: '发送失败' });
    }
    res.status(200).json({ success: '发送成功', response: info.response });
  });
});

// Pinecone 数据库查询
const config = new Pinecone({
  apiKey: 'your-pinecone-api-key',
});

app.post('/queryPinecone', async (req, res) => {
  try {
    const { vector } = req.body;
    const index = Pinecone.index('your-index-name');
    const response = await index.query({
      vector: vector,
      topK: 5,
    });
    res.status(200).json(response.data.matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
*/
