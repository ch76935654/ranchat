import bg from "../assets/bg.png";
import { useNavigate } from "react-router-dom";
import { useAccount } from "./../context/AccountContext";

export default function HomePage() {
  const navigate = useNavigate();
  const { accountEmail } = useAccount();

  function handleStart() {
    if (accountEmail) {
      navigate("/chat");
    } else {
      navigate("/log");
    }
  }
  return (
    <div>
      <div className="mt-6">
        <div className="body-font relative">
          <div className="container mx-auto flex justify-center px-5 py-24">
            <div className="felx-row absolute inset-0 z-0 flex justify-center">
              <img
                className="absolute inset-0 h-[1100px] w-full rounded-lg object-cover object-center blur-md brightness-75 filter"
                src={bg}
                alt="Background"
              ></img>
            </div>
            <div className="relative z-10 mt-48 flex w-[600px] flex-col rounded-lg bg-white bg-opacity-60 p-8 shadow-md ">
              <h2 className="title-font mb-8 mt-2 text-center text-6xl font-bold tracking-widest text-gray-900">
                IndiviMosaic
              </h2>
              <p className="mb-5 leading-relaxed ">
                结合了“Individual”（个体）和“Mosaic”（马赛克），暗示每个人的记忆和经历都是独一无二的碎片，汇集在一起形成了一个完整的个性画像。应用程序旨在捕捉和重构每个用户的独特记忆模式的功能，正如马赛克艺术品那样，由许多不同的小块组合而成。
              </p>

              <button
                className="rounded border-0 bg-indigo-500 px-6 py-2 text-lg text-white hover:bg-indigo-600 focus:outline-none"
                onClick={handleStart}
              >
                开始使用
              </button>
              <p className="mt-3 text-xs">
                请注册后使用，我们将为您提供一个安全的环境，保护您的个人信息。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
