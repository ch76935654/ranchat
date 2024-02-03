// 导入整个 pg 包
import pkg from "pg";

// 解构出 Pool
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT, // 默认端口
});

//postgreSQL插入新数据
async function insertData(
  memorySQLSpace,
  uuid,
  user_id,
  type,
  content,
  attitude,
) {
  // 1. 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 2. 准备 SQL 语句
    const queryText =
      "INSERT INTO public." +
      memorySQLSpace +
      "(uuid, user_id, type, content, attitude) VALUES($1, $2, $3, $4, $5)";

    // 3. 执行 SQL 语句
    const res = await client.query(queryText, [
      uuid,
      user_id,
      type,
      content,
      attitude,
    ]);

    console.log(res.rows[0]); // 打印插入结果
    console.log("postgreSQL上传成功");
  } catch (err) {
    console.error(err.stack);
  } finally {
    // 4. 关闭连接
    client.release();
  }
}

//根据UUID获取数据
async function getPostgreSQLDataByUUID(uuid) {
  // 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 准备 SQL 语句
    const queryText =
      "SELECT * FROM public.user_implicit_memory WHERE uuid = $1";

    // 执行 SQL 语句
    const res = await client.query(queryText, [uuid]);

    if (res.rows.length > 0) {
      console.log("查询结果:", res.rows[0]);
      return res.rows[0];
    } else {
      console.log("没有找到对应的数据");
      return null;
    }
  } catch (err) {
    console.error("查询错误", err.stack);
  } finally {
    // 关闭连接
    client.release();
  }
}

//根据type和user_id获取数据
async function getDataByTypeAndUserID(type, user_id) {
  // 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 准备 SQL 语句
    const queryText =
      "SELECT * FROM public.user_implicit_memory WHERE type = $1 AND user_id = $2";

    // 执行 SQL 语句
    const res = await client.query(queryText, [type, user_id]);

    if (res.rows.length > 0) {
      console.log("查询结果:", res.rows);
      return res.rows; // 返回所有匹配的行
    } else {
      console.log("没有找到对应的数据");
      return null;
    }
  } catch (err) {
    console.error("查询错误", err.stack);
  } finally {
    // 关闭连接
    client.release();
  }
}

export { insertData, getPostgreSQLDataByUUID, getDataByTypeAndUserID };
