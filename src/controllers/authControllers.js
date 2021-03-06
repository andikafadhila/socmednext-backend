const { createJwtAccess, createJwtemail } = require("../lib/jwt");
const {
  registerService,
  loginService,
  forgetPasswordService,
} = require("../services/authService");
const { dbCon } = require("./../connections");
const transporter = require("./../lib/transporter");
const handlebars = require("handlebars");
const myCache = require("./../lib/cache");
const path = require("path");
const fs = require("fs");
const hashPass = require("../lib/hashPass");

// register
const register = async (req, res) => {
  try {
    const { data: userData } = await registerService(req.body);

    let timecreated = new Date().getTime();

    const dataToken = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      timecreated,
    };

    let cached = myCache.set(userData.id, dataToken, 5 * 60);
    if (!cached) {
      throw { message: "error caching" };
    }

    const tokenAccess = createJwtAccess(dataToken);
    const tokenEmail = createJwtemail(dataToken);

    const host =
      process.env.NODE_ENV === "production"
        ? "http://namadomainfe"
        : "http://localhost:3000";
    const link = `${host}/verified/${tokenEmail}`;

    // let filepath = path.resolve(__dirname, "../template/emailTemplate.html");
    let htmlString = fs.readFileSync(
      "D:/Dev/Purwadhika/TA/socialmediaappbe/template/indexCopy.html",
      "utf-8"
    );

    const template = handlebars.compile(htmlString);
    const htmlToEmail = template({
      username: userData.username,
      link,
    });

    transporter.sendMail({
      from: "PhotoLab <andikarfadhila@gmail.com>",
      to: userData.email, //jangan lupa ganti email
      subject: "please click the link to verified your account",
      html: htmlToEmail,
    });
    res.set("x-token-access", tokenAccess);
    return res.status(200).send(userData);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};
// register

// Forget Password send email
const sendEmailForgetPassword = async (req, res) => {
  try {
    const { data: userData } = await forgetPasswordService(req.body);

    let timecreated = new Date().getTime();

    const dataToken = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      timecreated,
    };

    let cached = myCache.set(userData.id, dataToken, 5 * 60);
    if (!cached) {
      throw { message: "error caching" };
    }

    const tokenAccess = createJwtAccess(dataToken);
    const tokenEmail = createJwtemail(dataToken);

    const host =
      process.env.NODE_ENV === "production"
        ? "http://namadomainfe"
        : "http://localhost:3000";
    const link = `${host}/changepassword/${tokenEmail}`;

    // let filepath = path.resolve(__dirname, "../template/emailTemplate.html");
    let htmlString = fs.readFileSync(
      "D:/Dev/Purwadhika/TA/socialmediaappbe/template/indexCopyReset.html",
      "utf-8"
    );

    const template = handlebars.compile(htmlString);
    const htmlToEmail = template({
      username: userData.username,
      link,
    });

    transporter.sendMail({
      from: "PhotoLab <andikarfadhila@gmail.com>",
      to: userData.email,
      subject: "please click the link to verified your account",
      html: htmlToEmail,
    });
    res.set("x-token-access", tokenAccess);
    return res.status(200).send(userData);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};
// Forget Password send email

// Reset Password
const resetPassword = async (req, res) => {
  let conn, sql;
  const { id } = req.user;
  const { newPassword } = req.body;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `SELECT password FROM users WHERE id = ?`;
    let [result] = await conn.query(sql, id);
    let newPass = hashPass(newPassword);

    if (newPass == result[0].password) {
      throw { message: "Cannot use initial password." };
    }

    sql = `UPDATE users set ? WHERE id = ?`;
    let insertNewPass = {
      password: newPass,
    };
    let [result2] = await conn.query(sql, [insertNewPass, id]);

    conn.commit();
    return res.status(200).send({ message: "Reset Password Success!" });
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};
// Reset Password

// get username
const getusername = async (req, res, next) => {
  const { username } = await req.body;
  let conn, sql;

  conn = await dbCon.promise();
  sql = `SELECT username FROM users WHERE username = ?`;
  let [result] = await conn.query(sql, username);
  if (result.length) {
    res.send({ exists: result });
    next();
  } else {
    return res.status(200).send(result[0]);
  }
};
// get username

// get email
const getemail = async (req, res, next) => {
  const { email } = await req.body;
  let conn, sql;

  conn = await dbCon.promise();
  sql = `SELECT email FROM users WHERE email = ?`;
  let [result] = await conn.query(sql, email);
  if (result.length) {
    res.send({ exists: result });
    next();
  } else {
    return res.status(200).send(result[0]);
  }
};
// get email

// log in
const login = async (req, res) => {
  try {
    const { data: userData } = await loginService(req.body);

    const dataToken = {
      id: userData.id,
      username: userData.username,
    };

    const tokenAccess = createJwtAccess(dataToken);
    res.set("x-token-access", tokenAccess);
    return res.status(200).send(userData);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};
// log in

// keep log in
const keeplogin = async (req, res) => {
  const { id } = req.user;
  let conn;
  let sql;
  try {
    conn = await dbCon.promise();
    sql = `SELECT * FROM users where id = ?`;
    let [result] = await conn.query(sql, id);
    return res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};
// keep log in

// account Verified
const accountVerified = async (req, res) => {
  const { id } = req.user;
  let conn;
  let sql;

  try {
    conn = await dbCon.promise().getConnection();

    await conn.beginTransaction();

    // check if user already verified or not
    sql = `SELECT id FROM users WHERE id = ? and isVerified = 1`;
    let [userVerified] = await conn.query(sql, id);

    if (userVerified.length) {
      throw { message: "You already verified." };
    }

    // update data user to verified user
    sql = `UPDATE users SET ? WHERE id = ?`;
    let updateData = {
      isVerified: 1,
    };

    await conn.query(sql, [updateData, id]);

    sql = `SELECT id,username,isVerified,email FROM users WHERE id = ?`;
    let [result] = await conn.query(sql, id);
    await conn.commit();
    conn.release();
    return res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
    conn.release();
    return res.status(500).send({ message: error.message || error });
  }
};
// account Verified

// get user data
const getUserData = async (req, res) => {
  const { id } = req.user;
  let conn;
  let sql;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `SELECT id,username,isVerified,email FROM users WHERE id = ?`;
    let [result] = await conn.query(sql, id);
    conn.release();
    return res.status(200).send(result[0]);
  } catch (error) {
    console.log(error);
    conn.release();
    return res.status(500).send({ message: error.message || error });
  }
};
// get user data

// send Email Verified
const sendEmailVerified = async (req, res) => {
  const { id, email, username } = req.body;
  try {
    let timecreated = new Date().getTime();

    const dataToken = {
      id: id,
      username: username,
      email,
      timecreated,
    };

    let cached = myCache.set(id, dataToken, 5 * 60);
    if (!cached) {
      throw { message: "error caching" };
    }

    const tokenAccess = createJwtAccess(dataToken);
    const tokenEmail = createJwtemail(dataToken);

    const host =
      process.env.NODE_ENV === "production"
        ? "http://namadomainfe"
        : "http://localhost:3000";
    const link = `${host}/verified/${tokenEmail}`;

    // let filepath = path.resolve(__dirname, "../template/emailTemplate.html");
    let htmlString = fs.readFileSync(
      "D:/Dev/Purwadhika/TA/socialmediaappbe/template/indexCopy.html",
      "utf-8"
    );

    const template = handlebars.compile(htmlString);
    const htmlToEmail = template({
      username: username,
      link,
    });

    transporter.sendMail({
      from: "PhotoLab <andikarfadhila@gmail.com>",
      to: email, //jangan lupa ganti email
      subject: "please click the link to verified your account",
      html: htmlToEmail,
    });
    res.set("x-token-access", tokenAccess);
    return res.status(200).send(id, email, username);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};
// send Email Verified

// send Email Verified resend
const resendEmailVerified = async (req, res) => {
  const { id, email, username } = req.user;
  try {
    let timecreated = new Date().getTime();

    const dataToken = {
      id: id,
      username: username,
      email,
      timecreated,
    };

    let cached = myCache.set(id, dataToken, 5 * 60);
    if (!cached) {
      throw { message: "error caching" };
    }

    const tokenAccess = createJwtAccess(dataToken);
    const tokenEmail = createJwtemail(dataToken);

    const host =
      process.env.NODE_ENV === "production"
        ? "http://namadomainfe"
        : "http://localhost:3000";
    const link = `${host}/verified/${tokenEmail}`;

    // let filepath = path.resolve(__dirname, "../template/emailTemplate.html");
    let htmlString = fs.readFileSync(
      "D:/Dev/Purwadhika/TA/socialmediaappbe/template/indexCopy.html",
      "utf-8"
    );

    const template = handlebars.compile(htmlString);
    const htmlToEmail = template({
      username: username,
      link,
    });

    transporter.sendMail({
      from: "PhotoLab <andikarfadhila@gmail.com>",
      to: email, //jangan lupa ganti email
      subject: "please click the link to verified your account",
      html: htmlToEmail,
    });
    res.set("x-token-access", tokenAccess);
    return res.status(200).send(id, email, username);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};
// send Email Verified

const sendEmailResetPassword = async (req, res) => {
  const { id, email, username } = req.user;
  try {
    let timecreated = new Date().getTime();

    const dataToken = {
      id: id,
      username: username,
      timecreated,
    };

    let cached = myCache.set(id, dataToken, 5 * 60);
    if (!cached) {
      throw { message: "error caching" };
    }

    const tokenAccess = createJwtAccess(dataToken);
    const tokenEmail = createJwtemail(dataToken);

    const host =
      process.env.NODE_ENV === "production"
        ? "http://namadomainfe"
        : "http://localhost:3000";
    const link = `${host}/changepassword/${tokenEmail}`;

    // let filepath = path.resolve(__dirname, "../template/emailTemplate.html");
    let htmlString = fs.readFileSync(
      "D:/Dev/Purwadhika/TA/socialmediaappbe/template/indexCopyReset.html",
      "utf-8"
    );

    const template = handlebars.compile(htmlString);
    const htmlToEmail = template({
      username: username,
      link,
    });

    transporter.sendMail({
      from: "PhotoLab <andikarfadhila@gmail.com>",
      to: email, //jangan lupa ganti email
      subject: "please click the link to verified your account",
      html: htmlToEmail,
    });
    res.set("x-token-access", tokenAccess);
    return res.status(200).send(id, email, username);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};
// send Email Verified

module.exports = {
  register,
  getusername,
  getemail,
  login,
  keeplogin,
  accountVerified,
  sendEmailVerified,
  sendEmailForgetPassword,
  resetPassword,
  getUserData,
  sendEmailResetPassword,
  resendEmailVerified,
};
