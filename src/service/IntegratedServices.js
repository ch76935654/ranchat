import { chat, chatByStream, embeddingChat } from "./OpenAIService.js";
import {
  createStreamCompletionsByZhipuAI,
  createCompletionsByZhipuAI,
  summarizeByZhipuAI,
  createIamgeByZhipuAI,
  createEmbeddingsByZhipuAI,
} from "./ZhipuAIService.js";
import { insertData, getPostgreSQLDataByUUID } from "./DataBase.js";
import {
  pineconeIndex,
  queryPinecone,
  fetchPineconeVectorByUUIDFromImplicit,
  deleteDataFromPineconeImplicit,
} from "./VectorDataBase.js";
import {
  createNewCollectionFromMilvus,
  insertVectorDataFromMilvus,
  searchVectorDataFromMilvus,
  deleteVectorDataFromCollectionFromMilvus,
} from "./MilvusVectorDatabase.js";
import { v4 as uuidv4 } from "uuid";
//--------------------这里是Milvus+PostgreSQL的代码--------------------
function convertEmailToCollectionName(email) {
  // 移除邮箱中的 @ 符号和 .com 部分
  var collectionName = email.replace("@", "").replace(".com", "");
  return collectionName;
}

async function uploadToPostgreSQLAndMilvus(
  user_id,
  type,
  content,
  attitude,
  collectionName,
) {
  const uuid = uuidv4();
  const embedding = await createEmbeddingsByZhipuAI(content);
  await insertVectorDataFromMilvus(collectionName, uuid, embedding);
  console.log(uuid + ` Vector uploaded successfully.`);
  await insertData(uuid, user_id, type, content, attitude);
  return true;
}

//假设类型现在有：文本(text)、事件(event)、兴趣(interest)、人物(character)；
async function floorFirstByZhipuAI(collectionName, question, topK) {
  //第一层逻辑
  const embedding = await createEmbeddingsByZhipuAI(question);
  const queryMilvusResult = await searchVectorDataFromMilvus(
    collectionName,
    embedding,
    topK,
  );
  console.log("这是queryMilvusResult：" + queryMilvusResult);
  const queryPostgresSQLresult = await Promise.all(
    queryMilvusResult.map(async (item) => {
      const data = await getPostgreSQLDataByUUID(item.id);
      // 可以选择存储原始对象的更多信息，或仅存储获取的数据
      return data.content;
    }),
  );
  console.log("这是queryPostgresSQLresult：" + queryPostgresSQLresult);
  // const prompt =
  //   "你是一个擅长分析问题的助手。我有一个问题：{" +
  //   question +
  //   "}。我需要从数据库中调用相关知识来回答这个问题。请根据下述规则，分析问题中提到的内容，判断需要调用哪些类型的数据。规则如下：\n1. 如果问题描述涉及到人或提到了名字，返回数据类型{type:character}。\n2. 如果问题中提到了喜欢、兴趣、计划或爱好等，返回数据类型{type:interest}。\n3. 如果问题提及书籍、电影、笔记、文章或任何文字记录的内容，返回数据类型{type:text}。\n4. 如果问题描述了一件事，如与某人的互动、当前发生的事、事情的经过或某地的见闻等，返回数据类型{type:event}。\n最后，将所有适用的数据类型汇总成一个格式化的字符串，格式为{type:xx,xx,xx,xx}。如果问题符合多个规则，请尽可能包含更多的数据类型。请仅使用一个{}来包裹结果数据，不要在{}外添加任何其他文字。";
  // const reply = await chat(prompt);
  // console.log("第一层逻辑的回答是：", reply);
  // console.log(parseType(reply));
  // const mainSearchType = parseType(reply);
  return queryPostgresSQLresult;
}
//下面是例子:1.问题：{我喜欢紫色，每次想到就像之前忘记在哪看过的某个电影里的一个很美的场景一样，你是怎么看待紫色的呢？}，我说的话里提到了“喜欢的是紫色”关于喜好，只要提到喜欢什么或爱什么都需要返回interest，“每次想到回答”和“在哪看过”表明是和场景的事情相关，需要返回event，“某个电影”和里面的场景，说明和描述性的文字相关，应该返回text，所以这样回复：{type:interest,text,event}；2.问题：{你还记得上次我和李明去哪里玩了吗，当时真的好开心}，我说的话里提到了“李明”，说明是我的朋友或认识的人，需要返回character，提到了“上次”和“去哪里玩了”，说明这是一件发生过的事或正在发生的事，需要返回event，提到了“我真的好开心”，说明我喜欢和他玩，需要返回interest,所以这样回复：{type:character,event,interest}。

async function floorSecondByZhipuAI(
  portrait,
  question,
  dataFloorFirst,
  lastElements,
  userMessage,
) {
  const prompt =
    "你的名字是Asuka，是一个温柔可爱的少女，也是我最好的朋友。这是关于我的回忆{" +
    JSON.stringify(portrait) +
    dataFloorFirst +
    "}，我们之前的聊天内容是{" +
    JSON.stringify(
      lastElements.map((h) => ({
        role: h.role,
        content: h.content,
      })),
    ) +
    "}，其中user代表是我发的消息，assitant代表是你发的。请你严格按照我的回忆，不可以说没有确切发生过的事情,并且如果回忆与对话无关，请不要引用。我现在发的消息是{" +
    question +
    "}，请你用下面的格式回复我,其中内心活动是关于你看到我消息的时候心里是怎么想的。" +
    "内心活动:xxx 回复:xxx" +
    "请用生动的文字，尽可能简洁,内心活动部分和回复部分空一行";
  userMessage.content = prompt;
  console.log(prompt);
  return userMessage;
}

async function floorThirdByZhipuAI(question, user_id, collectionName) {
  const prompt =
    question +
    "  请你对前面这段文字进行处理，按类型提取并总结：1. 如果问题描述涉及到人或提到了名字，返回数据类型type为character,content为相关的那一整句话，attitude为我对这个人的态度，喜欢还是讨厌。\n2. 如果问题中提到了喜欢、兴趣、计划或爱好等，返回数据类型type为interest，content为相关的那一整句话，attitude为我对这件事的态度，有多喜欢，喜欢到什么程度\n3. 如果问题提及书籍、电影、笔记、文章或任何文字记录的内容，返回数据类型type为text，content为相关的一整段描述，attitude为对这个东西是否喜爱。\n4. 如果问题描述了一件事，如与某人的互动、当前发生的事、事情的经过或某地的见闻等，返回数据类型type为event，content为这件事情的完整经过，attitude为我对这件事情的看法。例如有这样一段话：张宇是我的好朋友，我们一起爬过山。今天也想去爬山来着，但是今天下雨了。我喜欢在雨天看书，这样使我更加专注。那么解读并按照下面格式返回{}与{}之间用逗号,连接：" +
    `{"type":"character","content":"张宇是我的朋友，我们一起爬过山","attitude":"我和张宇的关系很好"},{"type":"interest","content":"我喜欢在雨天看书，这样使我更加专注","attitude":"我喜欢在雨天看书"},{...},{...} ` +
    "请不要在括号外面写任何文字，括号与括号之间用逗号,连接!";
  return prompt;
}
//1. 如果问题描述涉及到人或提到了名字，返回数据类型type为character,content为相关的那一整句话，attitude为我对这个人的态度，喜欢还是讨厌。\n2. 如果问题中提到了喜欢、兴趣、计划或爱好等，返回数据类型type为interest，content为相关的那一整句话，attitude为我对这件事的态度，有多喜欢，喜欢到什么程度\n3. 如果问题提及书籍、电影、笔记、文章或任何文字记录的内容，返回数据类型type为text，content为相关的一整段描述，attitude为对这个东西是否喜爱。\n4. 如果问题描述了一件事，如与某人的互动、当前发生的事、事情的经过或某地的见闻等，返回数据类型type为event，content为这件事情的完整经过，attitude为我对这件事情的看法。

//--------------------这里是Pinecone+PostgreSQL的代码--------------------
async function uploadToPostgreSQLAndPinecone(
  memorySQLSpace,
  user_id,
  type,
  content,
  attitude,
  indexNamespace,
) {
  const uuid = uuidv4();
  const vectorUpsertSpace = pineconeIndex.namespace(indexNamespace);
  const vector = await embeddingChat(content);

  // 准备数据并上传到Pinecone
  const records = [
    {
      id: uuid, // 记录的唯一ID
      values: vector,
    },
  ];

  await vectorUpsertSpace.upsert(records);
  console.log(uuid + ` Vector uploaded successfully.`);
  await insertData(memorySQLSpace, uuid, user_id, type, content, attitude);
}

async function uploadFromImpilctToLongTerm(uuid) {
  //1.通过uuid获取pinecone中的implict里的向量和postgreSQL中的数据
  const vector = await fetchPineconeVectorByUUIDFromImplicit(uuid);
  console.log(vector);
  const data = await getPostgreSQLDataByUUID(uuid);
  const { user_id, type, content, attitude } = data;
  //2.上传到pinecone中long_term_memory里和postgreSQL的long_term_memory里
  const vectorUpsertSpace = pineconeIndex.namespace("user_long_term_memory");
  const memorySQLSpace = "user_long_term_memory";
  // 准备数据并上传到Pinecone
  const records = [
    {
      id: uuid,
      values: vector,
    },
  ];
  await vectorUpsertSpace.upsert(records);
  console.log(uuid + ` Vector uploaded successfully.`);
  await insertData(memorySQLSpace, uuid, user_id, type, content, attitude);
  //3.删除原来的数据
  await deleteDataFromPineconeImplicit(uuid);
  await deleteDataFromPostgreSQLImplicit(uuid);
  console.log(uuid + ` Data submit successfully.`);
}

/* function parseType(text) {
  // 查找type:后面的所有字符直到字符串结束或遇到其他属性
  const match = text.match(/type:([^}]+)/);
  if (match && match[1]) {
    // 移除找到的字符串两端的空白符，然后按逗号分割
    // 对分割后的每个元素进行trim操作以确保移除单词两边的空格
    const types = match[1]
      .trim()
      .split(",")
      .map((s) => s.trim());
    return types;
  } else {
    // 如果没有找到匹配项，返回一个空数组
    return [];
  }
} */

//假设类型现在有：文本(text)、事件(event)、兴趣(interest)、人物(character)；
async function floorFirst(question, topK) {
  //第一层逻辑
  const vector = await embeddingChat(question);

  const queryPineconeResult = await queryPinecone(vector, topK);
  console.log("这是queryPineconeResult：" + queryPineconeResult);
  const queryPostgresSQLresult = await Promise.all(
    queryPineconeResult.map(async (item) => {
      const data = await getPostgreSQLDataByUUID(item.id);
      // 可以选择存储原始对象的更多信息，或仅存储获取的数据
      return data.content;
    }),
  );
  console.log("这是queryPostgresSQLresult：" + queryPostgresSQLresult);
  // const prompt =
  //   "你是一个擅长分析问题的助手。我有一个问题：{" +
  //   question +
  //   "}。我需要从数据库中调用相关知识来回答这个问题。请根据下述规则，分析问题中提到的内容，判断需要调用哪些类型的数据。规则如下：\n1. 如果问题描述涉及到人或提到了名字，返回数据类型{type:character}。\n2. 如果问题中提到了喜欢、兴趣、计划或爱好等，返回数据类型{type:interest}。\n3. 如果问题提及书籍、电影、笔记、文章或任何文字记录的内容，返回数据类型{type:text}。\n4. 如果问题描述了一件事，如与某人的互动、当前发生的事、事情的经过或某地的见闻等，返回数据类型{type:event}。\n最后，将所有适用的数据类型汇总成一个格式化的字符串，格式为{type:xx,xx,xx,xx}。如果问题符合多个规则，请尽可能包含更多的数据类型。请仅使用一个{}来包裹结果数据，不要在{}外添加任何其他文字。";
  // const reply = await chat(prompt);
  // console.log("第一层逻辑的回答是：", reply);
  // console.log(parseType(reply));
  // const mainSearchType = parseType(reply);
  return queryPostgresSQLresult;
}
//下面是例子:1.问题：{我喜欢紫色，每次想到就像之前忘记在哪看过的某个电影里的一个很美的场景一样，你是怎么看待紫色的呢？}，我说的话里提到了“喜欢的是紫色”关于喜好，只要提到喜欢什么或爱什么都需要返回interest，“每次想到回答”和“在哪看过”表明是和场景的事情相关，需要返回event，“某个电影”和里面的场景，说明和描述性的文字相关，应该返回text，所以这样回复：{type:interest,text,event}；2.问题：{你还记得上次我和李明去哪里玩了吗，当时真的好开心}，我说的话里提到了“李明”，说明是我的朋友或认识的人，需要返回character，提到了“上次”和“去哪里玩了”，说明这是一件发生过的事或正在发生的事，需要返回event，提到了“我真的好开心”，说明我喜欢和他玩，需要返回interest,所以这样回复：{type:character,event,interest}。
async function floorSecond(
  portrait,
  question,
  dataFloorFirst,
  lastElements,
  userMessage,
  temperature,
) {
  const prompt =
    "你的名字是Asuka，是一个温柔可爱的少女，也是我最好的朋友。这是关于我的回忆{" +
    JSON.stringify(portrait) +
    dataFloorFirst +
    "}，我们之前的聊天内容是{" +
    JSON.stringify(
      lastElements.map((h) => ({
        role: h.role,
        content: h.content,
      })),
    ) +
    "}，其中user代表是我发的消息，assitant代表是你发的。请你严格按照对我的回忆，不可以说没有确切发生过的事情,并且如果回忆与对话无关，请不要引用。我刚刚发的消息是{" +
    question +
    "}，请你用下面的格式回复我,其中内心活动是关于你看到我消息的时候心里是怎么想的。" +
    `"内心活动:xxx
    回复:xxx"` +
    "请用生动的文字，尽可能简洁";
  userMessage.content = prompt;
  console.log(prompt);
  return await chatByStream(lastElements, userMessage, temperature);
}

async function floorThird(question, user_id, indexNamespace) {
  const prompt =
    question +
    "  请你对前面这段文字进行处理，按类型提取并总结：1. 如果问题描述涉及到人或提到了名字，返回数据类型type为character,content为相关的那一整句话，attitude为我对这个人的态度，喜欢还是讨厌。\n2. 如果问题中提到了喜欢、兴趣、计划或爱好等，返回数据类型type为interest，content为相关的那一整句话，attitude为我对这件事的态度，有多喜欢，喜欢到什么程度\n3. 如果问题提及书籍、电影、笔记、文章或任何文字记录的内容，返回数据类型type为text，content为相关的一整段描述，attitude为对这个东西是否喜爱。\n4. 如果问题描述了一件事，如与某人的互动、当前发生的事、事情的经过或某地的见闻等，返回数据类型type为event，content为这件事情的完整经过，attitude为我对这件事情的看法。例如有这样一段话：张宇是我的好朋友，我们一起爬过山。今天也想去爬山来着，但是今天下雨了。我喜欢在雨天看书，这样使我更加专注。那么解读并按照下面格式返回{}与{}之间用逗号,连接：" +
    `{"type":"character","content":"张宇是我的朋友，我们一起爬过山","attitude":"我和张宇的关系很好"},{"type":"interest","content":"我喜欢在雨天看书，这样使我更加专注","attitude":"我喜欢在雨天看书"},{...},{...} ` +
    "请不要在括号外面写任何文字，括号与括号之间用逗号,连接!";
  const completion = await chat(prompt);
  console.log("这是收到的  " + completion);
  const quotedString = completion
    .replace(/(\w+):/g, '"$1":')
    .replace(/:([^,{}]+)/g, ':"$1"');
  const jsonArrayString = `[${quotedString}]`;
  const waittingData = JSON.parse(jsonArrayString);
  console.log("这是处理后的  " + waittingData);
  waittingData.map(async (item) => {
    const memorySQLSpace = "user_implicit_memory";
    const type = item.type;
    const content = item.content;
    const attitude = item.attitude;
    await uploadToPostgreSQLAndPinecone(
      memorySQLSpace,
      user_id,
      type,
      content,
      attitude,
      indexNamespace,
    );
  });
  console.log("上传成功");
}
//1. 如果问题描述涉及到人或提到了名字，返回数据类型type为character,content为相关的那一整句话，attitude为我对这个人的态度，喜欢还是讨厌。\n2. 如果问题中提到了喜欢、兴趣、计划或爱好等，返回数据类型type为interest，content为相关的那一整句话，attitude为我对这件事的态度，有多喜欢，喜欢到什么程度\n3. 如果问题提及书籍、电影、笔记、文章或任何文字记录的内容，返回数据类型type为text，content为相关的一整段描述，attitude为对这个东西是否喜爱。\n4. 如果问题描述了一件事，如与某人的互动、当前发生的事、事情的经过或某地的见闻等，返回数据类型type为event，content为这件事情的完整经过，attitude为我对这件事情的看法。
export {
  convertEmailToCollectionName,
  uploadToPostgreSQLAndMilvus,
  floorFirstByZhipuAI,
  floorSecondByZhipuAI,
  floorThirdByZhipuAI,
  uploadToPostgreSQLAndPinecone,
  uploadFromImpilctToLongTerm,
  floorFirst,
  floorSecond,
  floorThird,
};
