import { createContext, useState, useContext } from "react";
import PropTypes from "prop-types";

const AccountContext = createContext();

function useAccount() {
  return useContext(AccountContext);
}

const AccountProvider = ({ children }) => {
  const [accountEmail, setAccountEmail] = useState(""); //用户名
  const [accountAPIkey, setAccountAPIkey] = useState(""); //API密钥
  const [temperature, setTemperature] = useState(0.5); //发散度
  const [historyNum, setHistoryNum] = useState(10); //上下文数量

  return (
    <AccountContext.Provider
      value={{
        accountEmail,
        setAccountEmail,
        accountAPIkey,
        setAccountAPIkey,
        temperature,
        setTemperature,
        historyNum,
        setHistoryNum,
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
