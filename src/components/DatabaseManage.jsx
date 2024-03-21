import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useAccount } from "./../context/AccountContext";

export default function DatabaseManage() {
  const { accountEmail, setAccountEmail } = useAccount();

  const [longTermList, setLongTermList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectCreatedAt, setSelectCreatedAt] = useState("");
  const [selectUpdatedAt, setSelectUpdatedAt] = useState("");
  const [selectType, setSelectType] = useState("");
  const [selectContent, setSelectContent] = useState("");
  const [selectAttitude, setSelectAttitude] = useState("");

  useEffect(() => {
    handleUpdateList(accountEmail);
  }, []);

  useEffect(() => {
    if (selectedId !== "") {
      const filteredList = longTermList.filter(
        (item) => item.uuid === selectedId,
      );
      if (filteredList.length > 0) {
        setSelectCreatedAt(filteredList[0].created_at);
        setSelectUpdatedAt(filteredList[0].updated_at);
        setSelectType(filteredList[0].type);
        setSelectContent(filteredList[0].content);
        setSelectAttitude(filteredList[0].attitude);
      }
    }
  }, [selectedId, longTermList]);

  async function handleUpdateList(user_id) {
    try {
      const response = await fetch("http://localhost:3001/returnList", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const { data } = await response.json();
      setLongTermList(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  async function handleUpdate() {
    try {
      const response = await fetch("http://localhost:3001/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: accountEmail,
          uuid: selectedId,
          type: selectType,
          content: selectContent,
          attitude: selectAttitude,
        }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const { status } = await response.json();
      if (status) {
        console.log("更新成功");
        handleUpdateList(accountEmail);
        setSelectedId("");
        setSelectCreatedAt("");
        setSelectUpdatedAt("");
        setSelectType("");
        setSelectContent("");
        setSelectAttitude("");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
  function handleRecover() {
    if (selectedId !== "") {
      const filteredList = longTermList.filter(
        (item) => item.uuid === selectedId,
      );
      if (filteredList.length > 0) {
        setSelectCreatedAt(filteredList[0].created_at);
        setSelectUpdatedAt(filteredList[0].updated_at);
        setSelectType(filteredList[0].type);
        setSelectContent(filteredList[0].content);
        setSelectAttitude(filteredList[0].attitude);
      }
    }
  }
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
                accountEmail={accountEmail}
                createdTime={item.created_at}
                updatedTime={item.updated_at}
                uuid={item.uuid}
                type={item.type}
                content={item.content}
                attitude={item.attitude}
                longTermList={longTermList}
                setLongTermList={setLongTermList}
                setSelectedId={setSelectedId}
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
            <div className="ml-4 p-1 text-xl">
              {selectCreatedAt ? selectCreatedAt : "点击修改后加载"}
            </div>
          </div>
          <div className="flex flex-row border-b p-4">
            <div className="border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              更新时间
            </div>
            <div className="ml-4 p-1 text-xl">
              {selectUpdatedAt ? selectUpdatedAt : "点击修改后加载"}
            </div>
          </div>
          <div className="flex flex-row border-b p-4">
            <div className="rounded border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              类型
            </div>
            <input
              value={selectType}
              onChange={(e) => {
                setSelectType(e.target.value);
              }}
              className="ml-4 w-[450px] rounded p-1 text-xl"
              placeholder="点击修改后加载"
            />
          </div>
          <div className="flex  flex-row border-b p-4">
            <div className="border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              内容
            </div>
            <textarea
              value={selectContent}
              onChange={(e) => {
                setSelectContent(e.target.value);
              }}
              className="ml-4 h-[500px] w-[450px] resize-none rounded p-1 text-xl"
              placeholder="点击修改后加载"
            />
          </div>
          <div className="flex flex-row border-b p-4">
            <div className="border-r-2 pr-4 text-3xl font-bold tracking-[5px]">
              态度
            </div>
            <textarea
              value={selectAttitude}
              onChange={(e) => {
                setSelectAttitude(e.target.value);
              }}
              className="ml-4 h-[200px] w-[450px] resize-none rounded p-1 text-xl"
              placeholder="点击修改后加载"
            />
          </div>
          <div className="mt-auto flex flex-row justify-between px-6 py-4">
            <button
              className="ml-2 rounded bg-blue-300 px-24 py-4 text-2xl"
              onClick={handleUpdate}
            >
              更新
            </button>
            <div className="border"></div>
            <button
              className="mr-2 rounded bg-blue-300 px-24 text-2xl"
              onClick={handleRecover}
            >
              恢复
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LongTermListItem({
  accountEmail,
  createdTime,
  updatedTime,
  uuid,
  type,
  content,
  attitude,
  longTermList,
  setLongTermList,
  setSelectedId,
}) {
  function handleDeleteLongTerm() {
    try {
      fetch("http://localhost:3001/deleteLongTerm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: accountEmail, uuid }),
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
        <div className="text-xl">创建时间</div>
        <div className="ml-4 p-1">{createdTime}</div>
        <button
          className="ml-auto rounded-lg bg-red-200 px-4 py-2"
          onClick={() => setSelectedId(uuid)}
        >
          修 改
        </button>
        <button
          className="ml-6 rounded-lg bg-red-200 px-4 py-2"
          onClick={handleDeleteLongTerm}
        >
          删 除
        </button>
      </div>
      <div className="flex flex-row p-4">
        <div className="text-xl">更新时间</div>
        <div className="ml-4 p-1">{updatedTime}</div>
      </div>
      <div className="flex flex-row p-4">
        <div className="text-xl">类型</div>
        <div className="ml-4 p-1">{type}</div>
      </div>
      <div className="flex flex-row p-4">
        <div className="text-xl">内容</div>
        <div className="ml-4 p-1">{content}</div>
      </div>
      <div className="flex flex-row p-4">
        <div className="text-xl">态度</div>
        <div className="ml-4 p-1">{attitude}</div>
      </div>
    </div>
  );
}

LongTermListItem.propTypes = {
  accountEmail: PropTypes.string.isRequired,
  createdTime: PropTypes.any.isRequired, // 这里需要根据实际情况修改验证规则
  updatedTime: PropTypes.any.isRequired,
  uuid: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  attitude: PropTypes.string.isRequired,
  longTermList: PropTypes.array.isRequired,
  setLongTermList: PropTypes.func.isRequired,
  setSelectedId: PropTypes.func.isRequired,
};
