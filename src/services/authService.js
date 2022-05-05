const { dbCon } = require("../connections");
const hashPass = require("../lib/hashPass");

// login Service
const loginService = async (data) => {
  let { username, email, password } = data;
  let conn;
  let sql;

  try {
    conn = await dbCon.promise().getConnection();

    password = hashPass(password);

    sql = `SELECT * FROM users WHERE (username = ? or email = ?) and password = ?`;
    let [result] = await conn.query(sql, [username, email, password]);

    console.log(result);

    if (!result.length) {
      throw { message: "User not found." };
    }

    conn.release();
    return { success: true, data: result[0] };
  } catch (error) {
    conn.release();
    console.log(error);
    throw new Error(error.message || error);
  }
};
// login Service

// register Service
const registerService = async (data) => {
  let conn;
  let sql;
  let { username, email, password } = data;

  try {
    conn = await dbCon.promise().getConnection();

    let space = new RegExp(/ /g);
    if (space.test(username)) {
      throw { message: `Don't use space on your username` };
    }

    await conn.beginTransaction();
    sql = `SELECT id FROM users WHERE username = ? or email = ?`;

    let [result] = await conn.query(sql, [username, email]);
    if (result.length) {
      throw { message: "your username has been used" };
    }

    sql = `INSERT INTO users set ?`;

    let insertData = {
      username,
      email,
      password: hashPass(password),
    };

    console.log("insertData", insertData);

    let [result2] = await conn.query(sql, insertData);

    sql = `select id,username,isVerified,email from users where id = ?`;
    let [userData] = await conn.query(sql, [result2.insertId]);
    console.log("userData", userData);
    await conn.commit();
    conn.release();
    return { success: true, data: userData[0] };
  } catch (error) {
    conn.rollback();
    conn.release();
    console.log(error);
    // return Error(error.message || error);
    throw new Error(error.message || error);
    // return { success: false, message: error.message || error };
  }
};
// register Service

// Forget Password Service
const forgetPasswordService = async (data) => {
  let conn;
  let sql;
  let { email } = data;

  try {
    conn = await dbCon.promise().getConnection();

    await conn.beginTransaction();
    sql = `SELECT id FROM users WHERE email = ?`;

    let [result] = await conn.query(sql, [email]);
    if (!result.length) {
      throw { message: "User not found!" };
    }

    sql = `select id,username,isVerified,email from users where email = ?`;
    let [userData] = await conn.query(sql, [email]);
    console.log("userData", userData);
    await conn.commit();
    conn.release();
    return { success: true, data: userData[0] };
  } catch (error) {
    conn.rollback();
    conn.release();
    console.log(error);
    // return Error(error.message || error);
    throw new Error(error.message || error);
    // return { success: false, message: error.message || error };
  }
};

module.exports = {
  loginService,
  registerService,
  forgetPasswordService,
};
