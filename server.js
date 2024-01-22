import express from "express";
import cors from "cors"; // 引入 cors 模块
import nodemailer from "nodemailer";

const app = express();
const port = 3001;

// app.use(cors({
//   origin: 'http://localhost:5173', // 允许的域名,这样配置后，只有 http://localhost:5173 这个域名的请求才会被允许。请根据你的实际需求来设置 CORS 配置。
// }));
app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
