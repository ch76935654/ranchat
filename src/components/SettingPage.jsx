import { useEffect } from "react";
import { useAccount } from "./../context/AccountContext";

export default function SettingPage() {
  const {
    accountEmail,
    accountAPIkey,
    setAccountAPIkey,
    canWork,
    setCanWork,
    length,
    setLength,
    portrait,
    setPortrait,
  } = useAccount();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("ranchat"));
    if (userData.apikey !== accountAPIkey) {
      setCanWork(false);
    }
  }, [accountAPIkey]);

  async function handleTestWork() {
    try {
      const response = await fetch("http://localhost:3001/testWork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: accountAPIkey,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const { status } = await response.json();
      if (status) {
        console.log("测试成功！");
        setCanWork(true);
        const userData = { account: accountEmail, apikey: accountAPIkey };
        localStorage.setItem("ranchat", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="m-4 mx-auto">
      <div className="flex flex-col">
        <div className=" flex flex-row items-center p-2">
          <div className="p-1 text-2xl">API Key</div>
          <input
            className="ml-6 w-96 rounded border p-2 text-xl"
            value={accountAPIkey}
            onChange={(e) => {
              setAccountAPIkey(e.target.value);
            }}
            placeholder="请在使用前输入您的智谱API Key"
          />
          {canWork ? (
            <svg
              className=" ml-4"
              width="40px"
              height="40px"
              viewBox="0 0 20 20"
              fill="#32CD32"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="0" fill="none" width="20" height="20" />

              <g>
                <path d="M10 2c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm-.615 12.66h-1.34l-3.24-4.54 1.34-1.25 2.57 2.4 5.14-5.93 1.34.94-5.81 8.38z" />
              </g>
            </svg>
          ) : (
            <button
              onClick={handleTestWork}
              className="ml-3 rounded-lg bg-red-400 p-2"
            >
              test
            </button>
          )}
        </div>
        <div className="flex flex-col items-center">
          <div className="ml-16 text-lg">
            请在每次更改API Key后重新点击测试后使用！
          </div>
          <div className="ml-16 text-lg">
            注意：未经验证的Key将无法跳转聊天及数据库管理。
          </div>
        </div>
        <div className="mt-2 flex flex-row p-2">
          <div className="p-1 text-2xl">上下文</div>
          <input
            className="ml-auto mr-14 w-96 rounded border p-2 text-xl"
            value={length}
            onChange={(e) => {
              setLength(e.target.value);
            }}
            placeholder="默认为20轮对话，理论上12万字以内"
          />
        </div>
        <div className="mt-2 flex flex-row p-2">
          <div className="p-1 text-2xl">用户画像</div>
          <textarea
            value={portrait}
            onChange={(e) => setPortrait(e.target.value)}
            placeholder={`请你严格按照这种形式去写:{"xx":"xx""xx":"xx","xx":"xx","xx":"xx","xx":"xx"},以便可以正常传达给模型`}
            className="ml-auto mr-14 h-[500px] w-96 resize-none rounded border p-2 text-xl"
          />
        </div>
      </div>
    </div>
  );
}
