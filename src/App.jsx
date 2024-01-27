import "./App.css";
//import Chatbox from "./components/Chatbox";
import DatabaseManage from "./components/DatabaseManage";

function App() {
  if (typeof global === "undefined") {
    window.global = window;
  }
  return (
    <>
      {/* <Chatbox /> */}
      <DatabaseManage />
    </>
  );
}

export default App;
