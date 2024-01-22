import nodemailer from "nodemailer";
const to = "2090244567@qq.com";
//创建一个SMTP客户端配置对象
const transporter = nodemailer.createTransport({
  // 默认支持的邮箱服务包括：”QQ”、”163”、”126”、”iCloud”、”Hotmail”、”Yahoo”等
  service: "QQ",
  auth: {
    // 发件人邮箱账号
    user: "qiuyingran5654@qq.com",
    //发件人邮箱的授权码 需要在自己的邮箱设置中生成,并不是邮件的登录密码
    pass: "ytfqpvatonmcbgga",
  },
});

// 配置收件人信息
const receiver = {
  // 发件人 邮箱  '昵称<发件人邮箱>'
  from: `"秋映染"<qiuyingran5654@qq.com>`,
  // 主题
  subject: "验证码",
  // 收件人 的邮箱 可以是其他邮箱 不一定是qq邮箱
  to: to,
  // 可以使用html标签
  html: `
   <h1>你好,你的验证码：</h1>
    <h1 style="color:red">123456</h1>
   `,
};

// 发送邮件

transporter.sendMail(receiver, (error, info) => {
  if (error) {
    return console.log("发送失败:", error);
  }

  console.log("发送成功:", info.response);
});
