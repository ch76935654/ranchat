import nodemailer from "nodemailer";

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
export function sendMail(to, code) {
  return new Promise((resolve, reject) => {
    const receiver = {
      from: `"秋映染"<qiuyingran5654@qq.com>`,
      subject: "验证码",
      to: to,
      html: `<h1>你好,你的验证码：</h1><h1 style="color:red">${code}</h1>`,
    };

    transporter.sendMail(receiver, (error, info) => {
      if (error) {
        console.log("发送失败:", error);
        reject("发送失败"); // 使用 reject 来返回错误状态
      } else {
        console.log("发送成功:", info.response);
        resolve("发送成功"); // 使用 resolve 来返回成功状态
      }
    });
  });
}
