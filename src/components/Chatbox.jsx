import OpenAI from "openai";
import { useState } from "react";

export default function Chatbox() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState([]);
  const [length, setLength] = useState(3);

  const apiKey = "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";
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true,
  });

  function handleChange(e) {
    setInput(e.target.value);
  }

  function handleSend() {
    setResponse(() => "");
    chat();
  }

  function handleHistory(input, response, length) {
    // 生成当前时间的时间戳作为id
    const currentTime = new Date().getTime();

    // 创建新的历史记录对象
    const newHistoryItem = {
      id: currentTime,
      user: input,
      assistant: response,
    };

    // 使用setHistory更新历史记录数组
    setHistory((prevHistory) => [...prevHistory, newHistoryItem]);

    if (history.length > length - 1) {
      // 如果数组长度大于3，删除第一个元素
      setHistory((prevHistory) => prevHistory.slice(1));
    }
  }

  async function chat() {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "你是个有用的助手." },
        {
          role: "user",
          content:
            JSON.stringify(history) +
            "\n以上为历史聊天记录\n下面是我的问题：" +
            input,
        },
      ],
      model: "gpt-3.5-turbo",
      stream: true,
    });

    let result = "";
    for await (const chunk of completion) {
      result += chunk.choices[0]?.delta?.content || "";
      setResponse(result);
      console.log(chunk);
    }
    handleHistory(input, result, length);
    //setResponse(completion.choices[0].message.content);
    //console.log(completion.choices[0]);
  }
  return (
    <div>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <h1 className="text-3xl font-bold underline">这是</h1>
      <input type="text" onChange={(e) => handleChange(e)} />
      <button onClick={handleSend}>chat</button>
      <div className="text-3xl font-bold underline">回复：{response}</div>
    </div>
  );
}
