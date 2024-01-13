import OpenAI from "openai";

export default function Chatbox() {
  const openai = new OpenAI({
    apiKey: "your-api-key",
    dangerouslyAllowBrowser: true,
  });

  async function chat() {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "你是个有用的助手." },
        { role: "user", content: "我该如何理解和光同尘这个词?" },
      ],
      model: "gpt-3.5-turbo",
    });

    console.log(completion.choices[0]);
  }
  return (
    <div className="chatbox">
      <h1>这是</h1>
      <button onClick={() => chat()}>chat</button>
    </div>
  );
}
