import express from "express";
import cors from "cors"; // 引入 cors 模块
import nodemailer from "nodemailer";
import { Pinecone } from "@pinecone-database/pinecone";

const app = express();
const port = 3001;

// app.use(cors({
//   origin: 'http://localhost:5173', // 允许的域名,这样配置后，只有 http://localhost:5173 这个域名的请求才会被允许。请根据你的实际需求来设置 CORS 配置。
// }));
app.use(cors());
app.use(express.json());

const config = new Pinecone({
  apiKey: "34f2630b-2f0d-477f-a9ba-61503e5fccf0",
});
// 初始化Pinecone客户端
Pinecone.initialize(config);

const transporter = nodemailer.createTransport({
  service: "QQ",
  auth: {
    user: "qiuyingran5654@qq.com",
    pass: "ytfqpvatonmcbgga",
  },
});

app.post("/sendMail", (req, res) => {
  const { to } = req.body;

  const receiver = {
    from: '"秋映染"<qiuyingran5654@qq.com>',
    subject: "验证码",
    to: to,
    html: `
      <h1>你好，你的验证码：</h1>
      <h1 style="color:red">123456</h1>
    `,
  };

  transporter.sendMail(receiver, (error, info) => {
    if (error) {
      return res.status(500).json({ error: "发送失败" });
    }

    res.status(200).json({ success: "发送成功", response: info.response });
  });
});

// Pinecone查询路由
app.post("/queryPinecone", async (req, res) => {
  try {
    const { vector } = req.body;
    const index = Pinecone.index("your-index-name");

    const response = await index.query({
      vector: vector,
      topK: 5, // 返回最相似的前5个结果
    });

    res.status(200).json(response.data.matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
