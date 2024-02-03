import ranchatLogo from "../assets/ranchat.png";

export default function HeaderBar() {
  return (
    <header className="body-font text-gray-600">
      <div className="container mx-auto flex flex-col flex-wrap items-center border-b p-5 md:flex-row">
        <a className="mb-4 flex items-center font-medium text-gray-900 md:mb-0">
          <img src={ranchatLogo} className="h-22 w-28 " />
          <span className="ml-3 text-2xl font-bold">秋映染</span>
        </a>
        <nav className="flex flex-wrap items-center justify-center text-base md:ml-auto md:mr-auto">
          <a className="mr-5 hover:text-gray-900">主页</a>
          <a className="mr-5 hover:text-gray-900">助手</a>
          <a className="mr-5 hover:text-gray-900">数据库管理</a>
          <a className="mr-5 hover:text-gray-900">纯聊天</a>
          <a className="mr-5 hover:text-gray-900">设置</a>
          <a className="mr-5 hover:text-gray-900">其它</a>
        </nav>
        <button className="mt-4 inline-flex items-center rounded border-0 bg-gray-100 px-3 py-1 text-base hover:bg-gray-200 focus:outline-none md:mt-0">
          登录
        </button>
      </div>
    </header>
  );
}
