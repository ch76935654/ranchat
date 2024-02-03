import "./App.css";
import HeaderBar from "./components/HeaderBar";
import LogPage from "./components/LogPage";
import ChatPage from "./components/ChatPage";

function App() {
  if (typeof global === "undefined") {
    window.global = window;
  }
  return (
    <div className="flex flex-col ">
      <HeaderBar />
      <LogPage />
      {/* <ChatPage /> */}
    </div>
  );
}

export default App;
