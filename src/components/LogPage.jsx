import { useState } from "react";
import { useAccount } from "./../context/AccountContext";

export default function LogPage() {
  const { accountEmail, setAccountEmail } = useAccount();

  const [logging, setLogging] = useState(true); //登录or注册
  const [email, setEmail] = useState(""); //邮箱
  const [password, setPassword] = useState(""); //密码
  const [code, setCode] = useState(""); //验证码
  const [status, setStatus] = useState(""); //是否发送验证码

  async function handleLog() {
    return fetch("http://localhost:3001/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.status);
        if (data.isLog) {
          setAccountEmail(email);
          localStorage.setItem("token", data.token);
          //跳转到主页
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async function handleSendCode() {
    if (email === "") {
      setStatus("请输入邮箱");
      return;
    }
    return fetch("http://localhost:3001/sendCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        setStatus(data.status);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  async function handleRegister() {
    if (password.length >= 8 && email.length > 0 && code.length > 0) {
      return fetch("http://localhost:3001/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, code }),
      })
        .then((response) => response.json())
        .then((data) => {
          setStatus(data.status);
          if (data.status === "注册成功") {
            localStorage.setItem("token", data.token);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      // 提示用户输入不合法
      setStatus("请确保输入的信息完整且密码长度不少于8位");
    }
  }

  return (
    <div className="flex h-full items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-700">
          IndiviMosaic AI
        </h2>
        {logging ? (
          <>
            <div className="mb-4">
              <button className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none">
                <i className="fab fa-facebook-f mr-2"></i>Continue with
                Facebook(暂不可用)
              </button>
            </div>

            <div className="mb-8">
              <button className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-700 focus:outline-none">
                <i className="fab fa-google mr-2"></i>Continue with
                Google(暂不可用)
              </button>
            </div>

            <div className="mb-6 flex items-center justify-between">
              <span className="w-1/5 border-b lg:w-1/4 dark:border-gray-600"></span>

              <a
                href="#"
                className="text-center text-xs uppercase text-gray-500"
              >
                or 邮箱登录
              </a>

              <span className="w-1/5 border-b lg:w-1/4 dark:border-gray-400"></span>
            </div>
          </>
        ) : null}
        <div className="mb-4">
          <label className="mb-2 block text-sm text-gray-600">邮箱</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="example@example.com"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 placeholder-gray-300 focus:border-blue-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm text-gray-600">密码</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="********"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 placeholder-gray-300 focus:border-blue-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {logging ? (
          <>
            <div className="mb-2 flex items-center justify-center">
              {status}
            </div>
            <div className="mb-6">
              <button
                className="w-full rounded bg-gray-800 px-3 py-4 text-white hover:bg-gray-600 focus:outline-none"
                onClick={handleLog}
              >
                登录
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex items-center">
              <input
                placeholder="********"
                className="flex-1 rounded border border-gray-300 px-3 py-2 placeholder-gray-300 focus:border-blue-500 focus:outline-none"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                className="ml-2 rounded bg-blue-500 px-3 py-2  text-white hover:bg-blue-400"
                onClick={handleSendCode}
              >
                发送验证码
              </button>
            </div>
            <div className="mb-2 flex items-center justify-center">
              {status}
            </div>
            <div className="mb-6">
              <button
                className="w-full rounded bg-gray-800 px-3 py-4 text-white hover:bg-gray-600 focus:outline-none"
                onClick={handleRegister}
              >
                注册
              </button>
            </div>
          </>
        )}

        <p className="text-center text-sm text-gray-400">
          {logging ? "没有账号？" : "已有账号？"}
          <button
            className="text-blue-500 hover:underline focus:underline focus:outline-none"
            onClick={() => setLogging(!logging)}
          >
            {logging ? "注册" : "登录"}
          </button>
        </p>
      </div>
    </div>
  );
}
