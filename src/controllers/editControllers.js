const { dbCon } = require("./../connections");
const sharp = require("sharp");
const { v4: uuid } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const updateBio = async (req, res) => {
  const { bio } = req.body;
  const { id } = req.user;
  let conn, sql;

  try {
    conn = await dbCon.promise();
    sql = `UPDATE users set bio = ? WHERE id = ?`;
    let [result] = await conn.query(sql, [bio, id]);
    conn.release();
    return res.status(200).send(result[0]);
  } catch (error) {
    conn.release();
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

const updateProfilePicture = async (req, res) => {
  let conn, sql;
  const { id } = req.user;
  try {
    conn = await dbCon.promise();
    if (!MIME_TYPE_MAP[req.file.mimetype])
      throw new HttpError("Invalid mimetype", 400);

    const folder = "uploads/images/";
    const name = uuid() + "." + "jpeg";
    const path = folder + name;

    const image = sharp(req.file.buffer);

    await image.toFormat("jpeg").jpeg({ quality: 80 }).toFile(path);
    sql = `UPDATE users set bio = ? WHERE id = ?`;
    let [result] = await conn.query(sql, [bio, id]);
    return res.status(200).send(result[0]);

    Promise.all;
  } catch (error) {
    return next(e);
  }
};

module.exports = {
  updateBio,
  updateProfilePicture,
};
