import { useState } from "react";
export default function LogPage() {
  return (
    <div className="flex flex-col ">
      <div className="flex flex-col items-center">
        <div className="m-2 text-2xl">IndiviMosaic AI</div>
        <div className="m-2 w-[420px] text-xl">
          结合了“Individual”和“Mosaic”，暗示每个人的记忆和经历都是独一无二的碎片，汇集在一起形成了一个完整的个性画像。应用程序旨在捕捉和重构每个用户的独特记忆模式的功能，正如马赛克艺术品那样，由许多不同的小块组合而成。
        </div>
      </div>
      <div className="flex flex-row justify-around">
        <div className="flex flex-col bg-purple-100">
          <div className="m-2 text-2xl">邮箱</div>
          <input className="m-2 rounded border-2" />
          <div className="m-2 text-2xl">密码</div>
          <input className="m-2 rounded border-2" />
          <div className="m-2 text-2xl">验证码</div>
          <input className="m-2 rounded border-2" />
          <button className="m-2 rounded bg-slate-400 p-2 text-2xl">
            注册
          </button>
        </div>
        <div className="flex flex-col bg-blue-100">
          <div className="m-2 text-2xl">邮箱</div>
          <input className="m-2 rounded border-2" />
          <div className="m-2 text-2xl">密码</div>
          <input className="m-2 rounded border-2" />
          <button className="m-2 rounded bg-slate-400 p-2 text-2xl">
            登录
          </button>
        </div>
      </div>
    </div>
  );
}
