// 导入整个 pg 包
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
// 解构出 Pool
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT, // 默认端口
});

async function logUser(email, password) {
  // 1. 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 2. 准备 SQL 语句来查询邮箱
    const queryEmail = "SELECT * FROM public.user_data WHERE email = $1";

    // 3. 执行 SQL 语句
    const res = await client.query(queryEmail, [email]);

    // 4. 检查是否找到了邮箱
    if (res.rows.length === 0) {
      return { status: "没有该邮箱，请注册", isLog: false };
    } else {
      // 5. 比对密码
      const user = res.rows[0]; // 假设查询结果中的第一行是我们需要的用户数据
      if (user.password === password) {
        const updateLoginTime =
          "UPDATE public.user_data SET last_login_time = NOW() WHERE email = $1";
        await client.query(updateLoginTime, [email]);
        return { status: "登录成功", isLog: true };
      } else {
        return { status: "密码错误", isLog: false };
      }
    }
  } catch (err) {
    console.error(err.stack);
    return { status: "登录过程中出现错误", isLog: false };
  } finally {
    // 6. 关闭连接
    client.release();
  }
}

async function findUserExist(email) {
  // 1. 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 2. 准备 SQL 语句来检查邮箱是否存在
    const queryText = "SELECT * FROM public.user_data WHERE email = $1";

    // 3. 执行 SQL 语句
    const res = await client.query(queryText, [email]);

    // 根据查询结果返回布尔值
    if (res.rows.length > 0) {
      console.log("该邮箱已存在");
      return true; // 存在时返回 true
    } else {
      console.log("该邮箱不存在");
      return false; // 不存在时返回 false
    }
  } catch (err) {
    console.error(err.stack);
    return false; // 发生异常时，为避免误操作，可以选择返回 false
  } finally {
    // 4. 关闭连接
    client.release();
  }
}

async function insertUser(email, password) {
  // 1. 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 2. 准备 SQL 语句
    const queryText =
      "INSERT INTO public.user_data" + "(email, password) VALUES($1, $2)";

    // 3. 执行 SQL 语句
    await client.query(queryText, [email, password]);

    console.log("postgreSQL上传成功");
    return true; // 上传成功返回 true
  } catch (err) {
    console.error(err.stack);
    return false; // 发生错误返回 false
  } finally {
    // 4. 关闭连接
    client.release();
  }
}

//postgreSQL插入新数据
async function insertData(uuid, user_id, type, content, attitude) {
  // 1. 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 2. 准备 SQL 语句
    const queryText =
      "INSERT INTO public.user_long_term_memory(uuid, user_id, type, content, attitude) VALUES($1, $2, $3, $4, $5)";

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
    if (res.rows.length > 0) {
      console.log("查询结果:", res.rows[0]);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(err.stack);
  } finally {
    // 4. 关闭连接
    client.release();
  }
}

//根据UUID获取数据
async function getPostgreSQLDataByUUIDAndUserId(uuid, user_id) {
  // 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 准备 SQL 语句
    const queryText =
      "SELECT * FROM public.user_long_term_memory WHERE uuid = $1 AND user_id = $2";

    // 执行 SQL 语句
    const res = await client.query(queryText, [uuid, user_id]);

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

async function updateDataByUUIDAndUserId(
  uuid,
  user_id,
  type,
  content,
  attitude,
) {
  // 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 准备 SQL 语句
    const queryText =
      "UPDATE public.user_long_term_memory SET type = $1, content = $2, attitude = $3 WHERE uuid = $4 AND user_id = $5 RETURNING *";

    // 执行 SQL 语句
    const res = await client.query(queryText, [
      type,
      content,
      attitude,
      uuid,
      user_id,
    ]);

    if (res.rows.length > 0) {
      console.log("更新后的数据:", res.rows[0]);
      return true;
    } else {
      console.log("没有找到对应的数据进行更新");
      return false;
    }
  } catch (err) {
    console.error("更新错误", err.stack);
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
      "SELECT * FROM public.user_long_term_memory WHERE type = $1 AND user_id = $2";

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

async function getDataByUserId(user_id) {
  // 使用参数连接到数据库
  const client = await pool.connect();

  try {
    // 准备 SQL 语句
    const queryText =
      "SELECT * FROM public.user_long_term_memory WHERE user_id = $1";

    // 执行 SQL 语句
    const res = await client.query(queryText, [user_id]);

    if (res.rows.length > 0) {
      console.log("查询结果:", res.rows);
      return res.rows; // 返回所有数据的数组
    } else {
      console.log("表中没有数据");
      return []; // 返回空数组
    }
  } catch (err) {
    console.error("查询错误", err.stack);
    throw err; // 抛出错误以便上层处理
  } finally {
    // 关闭连接
    client.release();
  }
}

async function deleteDataFromPostgreSQL(uuid, user_id) {
  // 使用参数连接到数据库
  const client = await pool.connect();
  try {
    // 准备 SQL 语句
    const queryText =
      "DELETE FROM public.user_long_term_memory WHERE uuid = $1 AND user_id = $2";

    // 执行 SQL 语句
    await client.query(queryText, [uuid, user_id]);

    console.log("成功删除数据" + uuid + "  " + user_id);
  } catch (error) {
    console.log(error);
  } finally {
    // 关闭连接
    client.release();
  }
}

export {
  logUser,
  findUserExist,
  insertUser,
  insertData,
  updateDataByUUIDAndUserId,
  getPostgreSQLDataByUUIDAndUserId,
  getDataByTypeAndUserID,
  getDataByUserId,
  deleteDataFromPostgreSQL,
};
