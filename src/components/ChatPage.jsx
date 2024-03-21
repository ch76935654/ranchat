import { useState, useEffect, useRef } from "react";
import gptLogo from "../assets/gpt.png";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMermaidPlugin from "remark-mermaid-plugin";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ModalImage from "react-modal-image";
import PropTypes from "prop-types";
import { useAccount } from "./../context/AccountContext";

export default function Chatbox() {
  const { accountEmail, setAccountEmail } = useAccount();

  const [input, setInput] = useState(""); //用户输入
  const [sliceHistory, setSliceHistory] = useState([]); //聊天框历史记录
  const [allHistory, setAllHistory] = useState([]); //所有聊天记录
  const [isSending, setIsSending] = useState(false); //是否正在发送邮件
  const [firstOpen, setFirstOpen] = useState(true); //是否是第一次打开
  const [titleAndTime, setTitleAndTime] = useState(["新对话", "新建时间", ""]); //标题和时间
  const [isSetting, setIsSetting] = useState(false); //是否正在设置
  const [user_id, setUser_id] = useState("2090244567@qq.com");

  const [apiKey, setApiKey] = useState(
    "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",
  ); //openai key
  const [temperature, setTemperature] = useState(1); //发散度
  const [length, setLength] = useState(10); //结合上下文
  // 将 waitingForMessage 从 useState 转换为 useRef
  const waitingForMessage = useRef(false);
  const [portrait, setPortrait] = useState({
    姓名: "秋映染",
    年龄: 20,
    性别: "男",
    职业: "游戏设计师",
    爱好: "游戏，电影，插花，音乐",
    短期计划: "做出第一款游戏",
    聊天偏好: "喜欢真实且有温度的聊天",
  }); //人物画像

  const socket = useRef(null); // 使用 useRef 保持对 WebSocket 的引用

  let finalHistory = [];
  useEffect(() => {
    setUser_id(accountEmail);
  }, [accountEmail]);
  // WebSocket 连接建立
  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:3002/");

    socket.current.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.current.onclose = (event) => {
      if (!event.wasClean) {
        console.log(`WebSocket disconnected unexpectedly: ${event.code}`);
        // 这里可以添加重连逻辑
      }
    };

    socket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.allChunks) {
        //console.log(data.allChunks);
        /* setSliceHistory((prevHistory) => {
          // 创建一个新的历史记录副本
          const newHistory = [...prevHistory];
          if (newHistory.length > 0) {
            newHistory[newHistory.length - 1].content = data.allChunks;
            return newHistory;
          }

          return prevHistory;
        }); */
      }
    };

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  function handleInputChange(e) {
    setInput(e.target.value);
  }

  function handleNewConversation() {
    setInput("");
    setFirstOpen(true);
    setSliceHistory([]);
    setTitleAndTime(["新对话", "新建时间", ""]);
  }

  function handleSelectConversation(selectId) {
    const selectConversation = allHistory.find(
      (c) => c.conversationId === selectId,
    );
    setSliceHistory(selectConversation.messages);
    setTitleAndTime([
      selectConversation.name,
      new Date(Number(selectId)).getFullYear() +
        "年" +
        (new Date(Number(selectId)).getMonth() + 1) +
        "月" +
        new Date(Number(selectId)).getDate() +
        "日",
      selectId,
    ]);
    setFirstOpen(false);
  }

  function handleClean() {
    let allConversations = allHistory;
    const selectId = titleAndTime[2];
    allConversations = allConversations.filter(
      (c) => c.conversationId !== selectId,
    );
    setAllHistory(allConversations);
    setFirstOpen(true);
    setSliceHistory([]);
    setTitleAndTime(["新对话", "新建时间", ""]);
  }

  function handleIsSetting() {
    setIsSetting((isSetting) => !isSetting);
  }

  async function handleSend() {
    setIsSending(true);
    if (input.trim()) {
      let createdTime = new Date().getTime().toString();
      const userMessage = {
        id: createdTime,
        role: "user",
        content: input,
      };
      const assistantMessage = {
        id: Number(createdTime) + 1,
        role: "assistant",
        content: "正在思考中...",
      };
      finalHistory = [...sliceHistory, userMessage, assistantMessage];
      setSliceHistory(finalHistory);
      // 在发送消息前设置 ref
      waitingForMessage.current = true;
      console.log("Sending message to WebSocket");
      const startIndex = Math.max(finalHistory.length - length - 2, 0);
      const lastElements = finalHistory.slice(startIndex, -2);
      // 发送用户输入到服务器
      if (socket.current) {
        socket.current.send(
          JSON.stringify({
            user_id: user_id,
            question: input,
            topK: 3,
            portrait: portrait,
            lastElements: lastElements,
            userMessage: userMessage,
            temperature: 1, // 这些值可能会根据你的需求变化
          }),
        );
      }
      // 使用 Promise 等待消息的到来，包括超时机制
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          waitingForMessage.current = false; // 使用 ref 更新
          console.error("WebSocket response timeout");
          reject("Timeout waiting for WebSocket response");
        }, 60000); // 60秒超时

        const originalOnMessage = socket.current.onmessage;
        socket.current.onmessage = (event) => {
          clearTimeout(timeout); // 清除超时定时器
          console.log("WebSocket message received");
          waitingForMessage.current = true;
          if (waitingForMessage.current) {
            const data = JSON.parse(event.data);
            if (data.allChunks) {
              setSliceHistory((prevHistory) => {
                const newHistory = [...prevHistory];
                const chunk = data.allChunks;
                if (newHistory.length > 0) {
                  newHistory[newHistory.length - 1].content = chunk;

                  return newHistory;
                }
                return prevHistory;
              });
              // 无论是否收到 allChunks，都重置等待状态并解析 Promise
              waitingForMessage.current = false;
            }
            if (data.finish === true) {
              resolve(data);
            }
          } else {
            originalOnMessage(event); // 使用原始处理程序
          }
        };
      })
        .then(async (data) => {
          setInput("");
          finalHistory[finalHistory.length - 1].content = data.allChunks;

          if (firstOpen) {
            const { name, dateString } = await handleSummarize(
              finalHistory,
              createdTime,
            );

            const date = new Date(dateString);
            setTitleAndTime([
              name,
              date.getFullYear() +
                "年" +
                (date.getMonth() + 1) +
                "月" +
                date.getDate() +
                "日",
              createdTime,
            ]);
            setFirstOpen(false);
            handleSaveAllHistory(createdTime, finalHistory, name);
            return;
          }
        })
        .catch((error) => console.error(error));

      if (!firstOpen) {
        if (finalHistory.length > 0) {
          createdTime = finalHistory[0].id;
          handleSaveAllHistory(createdTime, finalHistory);
        } else {
          console.error("finalHistory is empty");
        }
      }
    }
  }

  async function handleSummarize(finalHistory, createdTime) {
    return fetch("http://localhost:3001/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ finalHistory, createdTime }),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  function handleSaveAllHistory(searchId, finalHistory, name = "") {
    let allConversations = allHistory;
    let conversationExists = false;

    for (let conversation of allConversations) {
      if (conversation.conversationId === searchId) {
        // 如果存在，更新 messages 并标记已找到
        conversation.messages = finalHistory;
        conversationExists = true;
        break;
      }
    }
    // 如果不存在匹配的 conversationId，创建一个新的对话对象
    if (!conversationExists) {
      allConversations.unshift({
        conversationId: searchId,
        name: name,
        messages: finalHistory,
      });
    }
    setAllHistory(allConversations);
    setIsSending(false);
  }

  const CustomLink = ({ href, children }) => {
    return (
      <a
        href={href}
        className="link-highlight"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  };
  CustomLink.propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
  };

  const CodeBlock = ({ inline, className, children = "", ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={dark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")} {/* 直接作为内容传递 */}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };
  CodeBlock.propTypes = {
    inline: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
  };

  const CustomImage = ({ ...props }) => {
    const { src, ...rest } = props;
    if (!src) {
      // 可以选择在这里处理错误，或者返回null
      console.error("CustomImage requires a src prop");
      return null;
    }
    return <ModalImage {...rest} small={src} large={src} />;
  };
  CustomImage.propTypes = {
    src: PropTypes.string.isRequired,
    // ... 如果有其他props也应该在这里验证 ...
  };

  return (
    <div className="mt-8 flex flex-row justify-center p-2">
      <div className="w-150 mr-2 flex flex-col items-center">
        <div className="m-2 flex flex-row justify-center border-b border-blue-200 p-2 pb-4 ">
          <div className=" text-2xl font-bold">历史消息</div>
          <button
            className="ml-2 text-2xl hover:rounded-lg hover:shadow-lg"
            onClick={handleNewConversation}
            disabled={isSending}
          >
            📝
          </button>
        </div>
        <div className="max-h-[1000px] overflow-auto">
          {allHistory.map((h) => (
            <button
              className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 p-2 hover:shadow-lg"
              key={"cov" + h.conversationId}
              onClick={() =>
                handleSelectConversation(h.conversationId.match(/\d+/)[0])
              }
              disabled={isSending}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex max-h-[1300px] w-[900px] flex-col rounded-lg bg-purple-100 hover:shadow-lg">
        <div className="flex w-[900px] flex-col ">
          <div className="container flex max-h-[65px] flex-row border-blue-200 p-4 shadow-lg ">
            <div className="mx-auto flex items-center">
              <div className="ml-8 text-2xl font-bold ">
                {titleAndTime ? titleAndTime[0] : "新对话"}
              </div>
              <div className="ml-1 mt-2">
                {titleAndTime ? titleAndTime[1] : "新建时间"}
              </div>
              <button
                className="text-2xl"
                onClick={handleClean}
                disabled={isSending}
              >
                🧹
              </button>
            </div>
            <div className="flex items-center">
              <button
                className=" text-4xl"
                onClick={handleIsSetting}
                disabled={isSending}
              >
                ℹ️
              </button>
            </div>
          </div>
          <div className=" h-[905px] overflow-auto">
            {!isSetting ? (
              sliceHistory &&
              sliceHistory.map((item) => (
                <div
                  className={
                    "m-4 flex flex-row " +
                    (item.role === "user" ? "" : "justify-end")
                  }
                  key={item.id}
                >
                  <img src={gptLogo} className="size-12 rounded-lg shadow" />
                  <div
                    className={
                      "ml-2 mt-1 rounded-lg bg-blue-200 p-2 shadow " +
                      (item.role === "user" ? "" : "order-first mr-2")
                    }
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMermaidPlugin]}
                      rehypePlugins={[rehypeRaw, rehypeStringify]}
                      components={{
                        a: CustomLink,
                        code: CodeBlock,
                        img: CustomImage,
                        // p: ({ children }) => <div>{children}</div>,
                      }}
                    >
                      {item.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))
            ) : (
              <div className="mx-auto mt-8 flex h-[850px] w-[800px] flex-col items-center rounded-lg border-4 border-slate-300 bg-slate-100 shadow-2xl">
                <div className=" m-6 flex flex-row items-center">
                  <div className="mr-6 text-2xl">OPEN_AI_KEY :</div>
                  <input
                    type="text"
                    className="w-96 rounded-lg p-1 text-2xl"
                    value={apiKey}
                    placeholder="输入你的key"
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <div className="mt-6 flex flex-row justify-center">
                  <div className="mr-16 flex flex-col items-center">
                    <div className="text-2xl">发散度</div>
                    <input
                      type="text"
                      className="w-32 rounded-lg p-1 text-2xl"
                      placeholder="默认为1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                  </div>
                  <div className=" flex flex-col items-center">
                    <div className="text-2xl">结合上下文</div>
                    <input
                      type="text"
                      className="w-32 rounded-lg p-1 text-2xl"
                      placeholder="默认为最大"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className=" flex max-h-[200px] min-h-[60px] w-full flex-none resize-y flex-row items-center justify-center rounded-b-lg bg-purple-200 ">
            <textarea
              value={input}
              onChange={handleInputChange}
              className="m-2 max-h-[170px] min-h-[90px] flex-1 items-center rounded-lg p-2"
              placeholder="请输入内容"
              autoFocus={true}
              disabled={isSending}
            ></textarea>
            <button
              className="mr-2 h-[50px] w-[80px] rounded-lg bg-blue-200 text-lg font-bold"
              onClick={handleSend}
              disabled={isSending}
            >
              发送⏏️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
