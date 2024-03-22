import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";

const AccountContext = createContext();

function useAccount() {
  return useContext(AccountContext);
}

const AccountProvider = ({ children }) => {
  const [accountEmail, setAccountEmail] = useState(""); //用户名
  const [accountAPIkey, setAccountAPIkey] = useState(""); //API密钥
  const [hasLogin, setHasLogin] = useState(false);
  const [canWork, setCanWork] = useState(false); //是否可以工作
  const [length, setLength] = useState(20); //结合上下文
  const [portrait, setPortrait] = useState(`{
    姓名: "秋映染",
    年龄: 20,
    性别: "男",
    职业: "游戏设计师",
    爱好: "游戏，电影，插花，音乐",
    短期计划: "做出第一款游戏",
    聊天偏好: "喜欢真实且有温度的聊天",
  }`); //用户画像
  //ChatPage变量
  const [sliceHistory, setSliceHistory] = useState([]); //聊天框历史记录
  const [allHistory, setAllHistory] = useState([]); //所有聊天记录
  const [titleAndTime, setTitleAndTime] = useState(["新对话", "新建时间", ""]); //标题和时间

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("ranchat"));
    if (userData) {
      setAccountEmail(userData.account);
      setAccountAPIkey(userData.apikey);
      // 如果本地存储中存在token，则认为用户已登录
      // 这里可以根据需要设置其他登录状态
      // 例如：setAccountEmail(email);
      // 这里可能需要检查token的有效性，例如验证token是否过期
      // 如果需要，也可以在此处向后端验证token的有效性
      // 然后再设置登录状态
    }
  }, []);

  return (
    <AccountContext.Provider
      value={{
        accountEmail,
        setAccountEmail,
        accountAPIkey,
        setAccountAPIkey,
        hasLogin,
        setHasLogin,
        canWork,
        setCanWork,
        length,
        setLength,
        portrait,
        setPortrait,
        sliceHistory,
        setSliceHistory,
        allHistory,
        setAllHistory,
        titleAndTime,
        setTitleAndTime,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

AccountProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { useAccount, AccountProvider };
