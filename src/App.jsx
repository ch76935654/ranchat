import "./App.css";
import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import HeaderBar from "./components/HeaderBar";
import HomePage from "./components/HomePage";
import LogPage from "./components/LogPage";
import ChatPage from "./components/ChatPage";
import DatabaseManage from "./components/DatabaseManage";
import SettingPage from "./components/SettingPage";

import Footer from "./components/Footer";
import { AccountProvider } from "./context/AccountContext";

const router = createBrowserRouter([
  {
    path: "/", //首页
    element: (
      <>
        <HeaderBar />
        <Outlet />
        <Footer />
      </>
    ),
    /*     errorElement: <Error />, */

    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/log",
        element: <LogPage />,
        /*         action: createOrderAction, */
      },
      {
        path: "/chat",
        element: <ChatPage />,
        /*         action: createOrderAction, */
      },
      {
        path: "/database",
        element: <DatabaseManage />,
      },
      {
        path: "/setting",
        element: <SettingPage />,
      },

      /*       {
        path: "/order/:orderId",
        element: <Order />,
        loader: orderLoader,
        errorElement: <Error />,
        action: updateOrderAction,
      }, */
    ],
  },
]);

function App() {
  if (typeof global === "undefined") {
    window.global = window;
  }

  return (
    <AccountProvider>
      <div className="flex h-screen flex-col">
        <RouterProvider router={router} />
        {/* <LogPage /> */}
        {/* <ChatPage /> */}
      </div>
    </AccountProvider>
  );
}

export default App;
