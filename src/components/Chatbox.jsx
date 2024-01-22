import OpenAI from "openai";
import { useState } from "react";
import gptLogo from "../assets/gpt.png";
import ranchatLogo from "../assets/ranchat.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMermaidPlugin from "remark-mermaid-plugin";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark as dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ModalImage from "react-modal-image";
import PropTypes from "prop-types";

export default function Chatbox() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]); //历史记录
  const [isSending, setIsSending] = useState(false); //是否正在发送邮件
  const [title, setTitle] = useState(""); //标题

  const apiKey = "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";
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  function handleInputChange(e) {
    setInput(e.target.value);
  }

  function handleSend() {
    setIsSending(true);
    if (input.trim()) {
      chat(input);
      setInput("");
    }
    setIsSending(false);
  }

  async function chat(userInput) {
    const length = history.length;
    const createdTime = new Date().getTime().toString();
    const userMessage = {
      id: createdTime + "user",
      role: "user",
      content: userInput,
    };
    const assistantMessage = {
      id: createdTime + "assistant",
      role: "assistant",
      content: "正在思考中...",
    };

    setHistory((prevHistory) => [
      ...prevHistory,
      userMessage,
      assistantMessage,
    ]);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [...history, userMessage].map((h) => ({
          role: h.role,
          content: h.content,
        })),
        stream: true,
      });

      let allChunks = "";
      for await (const chunk of completion) {
        const contentChunk = chunk.choices[0]?.delta?.content || "";
        allChunks += contentChunk;
        setHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          const index = newHistory.findIndex(
            (msg) => msg.id === assistantMessage.id,
          ); //会返回被查找元素在数组中的索引，如果没有找到则返回-1。
          if (index !== -1) {
            newHistory[index].content = allChunks;
          }
          return newHistory;
        });

        if (chunk.choices[0]?.finish_reason === "stop") {
          break;
        }
      }
      if (length === 0) {
        summarize();
      }
    } catch (error) {
      console.error("Error with the streaming API:", error);
    }
  }

  async function summarize() {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          ...history,
          {
            role: "user",
            content:
              "请为我用10个字以下的语言概括上面的聊天内容作为本次聊天的标题",
          },
        ],
      });
      setTitle(completion.choices[0]?.message.content);
    } catch (error) {
      console.error("Error with the summarize:", error);
    }
  }
  // const sendMail = async () => {
  //   const to = "2090244567@qq.com";

  //   try {
  //     const response = await fetch("http://localhost:3001/sendMail", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ to }),
  //     });

  //     const data = await response.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error("邮件发送失败:", error);
  //   }
  // };

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
    <div className="flex flex-col ">
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
      <div className="mt-2 flex flex-row justify-center p-2">
        <div className="w-150 mr-2 flex flex-col items-center">
          <div className="m-2 flex flex-row justify-center border-b border-blue-200 p-2 pb-4 ">
            <div className=" text-2xl font-bold">历史消息</div>
            <button className="ml-2 text-2xl hover:rounded-lg hover:shadow-lg">
              📝
            </button>
          </div>
          <div className="max-h-[1000px] overflow-auto">
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天1
            </div>
            <div className="m-2 flex h-16 w-36 flex-row items-center justify-center rounded bg-blue-200 hover:shadow-lg">
              聊天2
            </div>
          </div>
        </div>
        <div className="flex max-h-[1300px] w-[900px] flex-col rounded-lg bg-purple-100 hover:shadow-lg">
          <div className="flex w-[900px] flex-col ">
            <div className="container flex max-h-[65px] flex-row border-blue-200 p-4 shadow-lg ">
              <div className="mx-auto flex items-center">
                <div className="ml-8 text-2xl font-bold ">
                  {title ? title : "新对话"}
                </div>
                <div className="ml-1 mt-2">新建时间</div>
                <button className="text-2xl">🧹</button>
              </div>
              <div className="flex items-center">
                <button className=" text-4xl">ℹ️</button>
              </div>
            </div>
            <div className=" h-[905px] overflow-auto">
              {history &&
                history.map((item) => (
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
                ))}
              {/* <div className="m-auto flex h-[850px] w-[800px] flex-col items-center rounded-lg border-4 border-slate-300 bg-slate-100 shadow-2xl">
              <div className=" m-6 flex flex-row items-center">
                <div className="mr-6 text-2xl">OPEN_AI_KEY :</div>
                <input type="text" className="w-96 rounded-lg text-4xl" />
              </div>
              <div className="mt-6 flex flex-row justify-center">
                <div className="mr-16 flex flex-col items-center">
                  <div className="text-2xl">最大token数</div>
                  <input type="text" className="w-32 rounded-lg text-4xl" />
                </div>
                <div className="mr-16 flex flex-col items-center">
                  <div className="text-2xl">发散度</div>
                  <input type="text" className="w-32 rounded-lg text-4xl" />
                </div>
                <div className=" flex flex-col items-center">
                  <div className="text-2xl">结合上下文</div>
                  <input type="text" className="w-32 rounded-lg text-4xl" />
                </div>
              </div>
            </div> */}

              {/* <div className="m-4 flex flex-row ">
                <img src={gptLogo} className="size-12 rounded-lg shadow" />
                <div className="ml-2 mt-1 rounded-lg bg-blue-200 p-2 shadow">
                  对话1
                </div>
              </div>
              <div className="m-4 flex flex-row justify-end">
                <img src={gptLogo} className="size-12 rounded-lg shadow" />
                <div className="order-first ml-2 mr-2 mt-1 rounded-lg bg-blue-200 p-2 shadow">
                  对话1
                </div>
              </div>*/}
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
              >
                发送⏏️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
