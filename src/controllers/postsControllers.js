const { dbCon } = require("../connections");

// create a post

const posting = async (req, res) => {
  const { id, caption, image } = req.body;
  let conn;
  let sql;
  console.log(req.body);
  console.log(req.user);
  console.log(req.file);

  try {
    conn = await dbCon.promise().getConnection();

    sql = `INSERT INTO posts SET ?`;
    let insertData = {
      users_id: id,
      caption: caption,
    };
    let [captionData] = await conn.query(sql, insertData);

    sql = `INSERT INTO post_images set ?`;

    for (let i = 0; i < image.length; i++) {
      let val = image[i];
      let insertDataImage = {
        posts_id: val.postsid,
        image: image,
      };
      await conn.query(sql, insertDataImage);
    }
    await conn.commit();
    conn.release();
    return res.status(200).send({ message: "successfully posting" });
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

// get all post
const getpost = async (req, res) => {
  let conn, sql;

  try {
    sql = `SELECT * FROM posts`;
    let [result] = conn.query(sql);

    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

// get post by id
const getPostById = async (req, res) => {
  const { users_id } = req.body;

  try {
    sql = `SELECT * FROM posts WHERE id = ?`;
    let [result] = await conn.query(sql, users_id);

    conn.release();
    return res.status(200).send(result[0]);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

// delete post
const deletepost = async (req, res) => {
  const { id } = req.body;

  try {
    sql = `DELETE FROM posts WHERE id = ?`;
    conn.query(sql, id);
    conn.release();
    return res.status(200).send({ message: "successfull to delete post" });
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

// like a post
// const likeAPost = async (req,res) => {
//   const {}

//   try {

//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// }

// unlike a post

// get all like of a post

// create a comment

// delete a comment

module.exports = {
  posting,
  getpost,
  getPostById,
  deletepost,
};
