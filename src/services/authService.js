const { dbCon } = require("../connections");
const hashPass = require("../lib/hashPass");
// login Service

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
      throw { message: "your username or password has been used" };
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

module.exports = {
  // loginService,
  registerService,
};
