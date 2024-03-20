import { useAccount } from "./../context/AccountContext";

export default function SettingPage() {
  const {
    accountAPIkey,
    setAccountAPIkey,
    temperature,
    setTemperature,
    historyNum,
    setHistoryNum,
  } = useAccount();

  return (
    <div className="m-4 flex flex-col items-center">
      <h1>设置页面</h1>
      <div className="mt-2">
        <div className=" flex flex-row">
          <div className="mr-2">API Key</div>
          <input
            className="ml-auto border"
            value={accountAPIkey}
            onChange={(e) => {
              setAccountAPIkey(e.target.value);
            }}
          />
        </div>
        <div className=" mt-2 flex flex-row">
          <div className="mr-2">发散度</div>
          <input
            className="ml-auto border"
            value={temperature}
            onChange={(e) => {
              setTemperature(e.target.value);
            }}
          />
        </div>
        <div className=" mt-2 flex flex-row">
          <div className="mr-2">上下文</div>
          <input
            className="ml-auto border"
            value={historyNum}
            onChange={(e) => {
              setHistoryNum(e.target.value);
            }}
          />
        </div>
        <div className=" mt-2 flex flex-row">
          <div className="mr-2">用户画像</div>
          <textarea className="ml-auto h-96 border" />
        </div>
      </div>
    </div>
  );
}
