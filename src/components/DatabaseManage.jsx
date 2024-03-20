import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import MySVG from "../assets/arrow.svg"; // 导入SVG文件

export default function DatabaseManage() {
  const [implicitList, setImplicitList] = useState([]);
  const [longTermList, setLongTermList] = useState([]);

  async function handleUpdateList(tableName) {
    try {
      const response = await fetch("http://localhost:3001/returnList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const { data } = await response.json();
      if (tableName === "user_implicit_memory") setImplicitList(data);
      if (tableName === "user_long_term_memory") setLongTermList(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    handleUpdateList("user_implicit_memory");
    handleUpdateList("user_long_term_memory");
  }, []);

  return (
    <div className=" mx-auto my-8 flex flex-row">
      <div className="  ">
        <div className="flex h-[70px] flex-row justify-center rounded-t-lg bg-slate-400 shadow-lg">
          <div className="m-4 text-4xl tracking-[10px]">记忆数据管理</div>
        </div>
        <div className=" h-max-[1000px] h-[1000px] w-[600px] flex-col overflow-auto rounded-b border shadow">
          {longTermList.map((item) => {
            return (
              <LongTermListItem
                key={item.uuid}
                createdTime={item.created_at}
                updatedTime={item.updated_at}
                uuid={item.uuid}
                type={item.type}
                content={item.content}
                attitude={item.attitude}
                longTermList={longTermList}
                setLongTermList={setLongTermList}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <svg
          width="200px"
          height="120px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19M19 12L13 6M19 12L13 18"
            stroke="#0891B2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          width="200px"
          height="120px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 12H19M19 12L13 6M19 12L13 18"
            stroke="#0891B2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <div className="h-max-[1070px] flex h-[1070px] w-[600px] flex-col rounded border bg-slate-300">
          <div className="flex flex-row border-b p-4">
            <div className="border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              创建时间
            </div>
            <div className="ml-4 p-1 text-xl">2024-03-01T09:17:50.764Z</div>
          </div>
          <div className="flex flex-row border-b p-4">
            <div className="border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              更新时间
            </div>
            <div className="ml-4 p-1 text-xl">dddd</div>
          </div>
          <div className="flex flex-row border-b p-4">
            <div className="rounded border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              类型
            </div>
            <input className="ml-4 w-[450px] p-1 text-xl" placeholder="ddd" />
          </div>
          <div className="flex  flex-row border-b p-4">
            <div className="border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              内容
            </div>
            <textarea className="ml-4 h-[500px] w-[450px] resize-none rounded p-1 text-xl" />
          </div>
          <div className="flex flex-row border-b p-4">
            <div className="border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              态度
            </div>
            <textarea
              className="ml-4 h-[200px] w-[450px] resize-none rounded p-1 text-xl"
              placeholder="ddd"
            />
          </div>
          <div className="mt-auto flex flex-row justify-between px-6 py-4">
            <button className="ml-2 rounded bg-blue-300 px-24 py-4 text-2xl">
              提交
            </button>
            <div className="border"></div>
            <button className="mr-2 rounded bg-blue-300 px-24 text-2xl">
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LongTermListItem({
  createdTime,
  updatedTime,
  uuid,
  type,
  content,
  attitude,
  longTermList,
  setLongTermList,
}) {
  function handleDeleteLongTerm() {
    try {
      fetch("http://localhost:3001/deleteLongTerm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid }),
      });

      const newLongTermList = longTermList
        .slice()
        .filter((item) => item.uuid !== uuid);
      setLongTermList(newLongTermList);
      console.log("删除成功");
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div className="m-3 flex-col rounded-lg bg-blue-200 hover:shadow-lg">
      <div className="flex flex-row p-4">
        <div className="">创建时间</div>
        <div className="ml-4">{createdTime}</div>
        <button className="ml-auto bg-red-200">修改</button>
        <button className="ml-4 bg-red-200" onClick={handleDeleteLongTerm}>
          删除
        </button>
      </div>
      <div className="flex flex-row p-4">
        <div className="">更新时间</div>
        <div className="ml-4">{updatedTime}</div>
      </div>
      <div className="flex flex-row p-4">
        <div>类型</div>
        <div className="ml-4">{type}</div>
      </div>
      <div className="flex flex-row p-4">
        <div className="">内容</div>
        <div className="ml-4">{content}</div>
      </div>
      <div className="flex flex-row p-4">
        <div className="">态度</div>
        <div className="ml-4">{attitude}</div>
      </div>
    </div>
  );
}

LongTermListItem.propTypes = {
  createdTime: PropTypes.any.isRequired, // 这里需要根据实际情况修改验证规则
  updatedTime: PropTypes.any.isRequired,
  uuid: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  attitude: PropTypes.string.isRequired,
  longTermList: PropTypes.array.isRequired,
  setLongTermList: PropTypes.func.isRequired,
};
