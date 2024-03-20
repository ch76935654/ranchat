import ranchatLogo from "../assets/ranchat.png";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAccount } from "./../context/AccountContext";

export default function HeaderBar() {
  const { accountEmail, setAccountEmail } = useAccount();
  const [hasLogin, setHasLogin] = useState(false);

  useEffect(() => {
    if (accountEmail) {
      setHasLogin(true);
    } else {
      setHasLogin(false);
    }
  }, [accountEmail]);

  function handleLogOut() {
    setAccountEmail(null);
  }

  return (
    <header className="body-font text-gray-600">
      <div className="container mx-auto flex flex-col flex-wrap items-center border-b p-5 md:flex-row">
        <a className="mb-4 flex items-center font-medium text-gray-900 md:mb-0">
          <img src={ranchatLogo} className="h-22 w-28 " />
          <span className="ml-3 text-2xl font-bold">秋映染</span>
        </a>
        <nav className="flex flex-wrap items-center justify-center text-base md:ml-auto md:mr-auto">
          <Link to="/" className="mr-5 hover:text-gray-900">
            主页
          </Link>
          <Link
            to="/chat"
            className="mr-5 hover:text-gray-900"
            state={{ email: "value" }}
          >
            聊天
          </Link>
          <Link to="/database" className="mr-5 hover:text-gray-900">
            数据库管理
          </Link>
          <Link to="/setting" className="mr-5 hover:text-gray-900">
            设置
          </Link>
        </nav>
        {hasLogin && (
          <div>
            <div className="mt-4 inline-flex items-center rounded border-0 bg-gray-100 px-3 py-1 text-base  focus:outline-none md:mt-0">
              {accountEmail}
            </div>
            <button
              className="ml-2 mt-4 inline-flex items-center rounded border-0 bg-gray-100 px-3 py-1 text-base hover:bg-gray-200 focus:outline-none md:mt-0"
              onClick={handleLogOut}
            >
              退出
            </button>
          </div>
        )}
        {!hasLogin && (
          <nav>
            <Link
              to="/log"
              className="mt-4 inline-flex items-center rounded border-0 bg-gray-100 px-3 py-1 text-base hover:bg-gray-200 focus:outline-none md:mt-0"
            >
              登录
            </Link>
          </nav>
        )}
      </div>
    </header>
    /* fetch("http://localhost:3001/someProtectedRoute", {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem('token') // 携带Token
      },
  }) */
  );
}
