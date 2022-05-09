const { dbCon } = require("./../connections");
const fs = require("fs");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const updateBio = async (req, res) => {
  const { bio, fullname, username } = req.body;
  const { id } = req.user;
  let conn, sql;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `SELECT username FROM users WHERE username = ? AND id != ?`;
    let [resultUser] = await conn.query(sql, [username, id]);

    if (resultUser.length) {
      throw { message: "username already registered!" };
    }

    sql = `UPDATE users SET ? WHERE id = ?`;
    const editData = {
      bio: bio,
      fullname: fullname,
      username: username,
    };
    let [result] = await conn.query(sql, [editData, id]);
    conn.commit();
    conn.release();
    return res
      .status(200)
      .send({ message: "success change profile data", editData });
  } catch (error) {
    conn.release();
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

// get username except user
const getusernameexceptuser = async (req, res, next) => {
  const { username, id } = req.body;
  // const { id } = req.user;

  let conn, sql;

  conn = await dbCon.promise();
  sql = `SELECT username FROM users WHERE username = ? AND id != ?`;
  let [result] = await conn.query(sql, [username, id]);
  console.log(result);
  if (result.length) {
    res.send({ exists: result });
    next();
  } else {
    return res.status(200).send(result[0]);
  }
};

// update avatar
const updateProfilePicture = async (req, res) => {
  let conn, sql;
  const { id } = req.user;

  let path = "/avatar";
  const imagePath = req.file ? `${path}/${req.file.filename}` : null;
  console.log(imagePath);
  if (!imagePath) {
    return res.status(500).send({ message: "foto tidak ada" });
  }

  console.log(req.file);

  try {
    conn = await dbCon.promise();
    // select data user dulu untuk dapetin path lamanya
    sql = `UPDATE users SET profilepic = ? WHERE id = ?`;
    let [result] = await conn.query(sql, [imagePath, id]);
    console.log(result);
    fs.unlinkSync;
    // if(imagePath){
    //   ./public + result[0].pro
    // }
    return res.status(200).send({ message: "berhasil di upload", imagePath });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

// delete avatar
const deleteProfilePicture = async (req, res) => {
  let conn, sql;
  const { id } = req.user;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `SELECT profilepic FROM users WHERE id = ?`;
    let [haveProfilepic] = await conn.query(sql, id);

    if (!haveProfilepic.length) {
      throw { message: "you already dont have an avatar!" };
    }

    sql = `UPDATE users SET profilepic = null WHERE id = ?`;
    let [result] = await conn.query(sql, [id]);
    console.log(result);
    return res.status(200).send({ message: "Avatar deleted!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

module.exports = {
  updateBio,
  updateProfilePicture,
  getusernameexceptuser,
  deleteProfilePicture,
};
