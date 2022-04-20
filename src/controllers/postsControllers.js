const { dbCon } = require("../connections");

// add image
const postImage = async (req, res) => {
  let conn, sql;
  let jalur = "/image";
  const { id } = req.user;

  console.log("ini req.files", req.files);
  const { image } = req.files;
  console.log("image", image);
  const imagearrpath = image
    ? image.map((val) => {
        return `${jalur}/${val.filename}`;
      })
    : [];

  console.log("ini imagearrpath", imagearrpath);

  // const imagePath = req.file ? `${path}/${req.file.filename}` : null;
  if (!imagearrpath) {
    return res.status(500).send({ message: "foto tidak ada" });
  }

  try {
    conn = await dbCon.promise();

    // insert into posts table

    // insert into  posts_images
    sql = `INSERT INTO posts_images set ?`;

    for (let i = 0; i < imagearrpath.length; i++) {
      let val = imagearrpath[i];
      let insertDataImage = {
        image: imagearrpath,
      };
      await conn.query(sql, insertDataImage);
    }

    // sql = `UPDATE users SET profilepic = ? WHERE id = ?`;
    // let [result] = await conn.query(sql, [imagePath, id]);
    // console.log(result);
    return res.status(200).send({ message: "berhasil di upload" });
  } catch (error) {
    console.log(error);
    if (imagePath) {
      // klo foto sudah terupload dan sql ggaal maka fotonya dihapus
      fs.unlinkSync("./public" + imagePath);
    }
    return res.status(500).send({ message: error.message || error });
  }
};

// create a post
// const posting = async (req, res) => {
//   const { id, caption, image } = req.body;
//   let conn;
//   let sql;
//   console.log(req.body);
//   console.log(req.user);
//   console.log(req.files);

//   try {
//     conn = await dbCon.promise().getConnection();

//     sql = `INSERT INTO posts SET ?`;
//     let insertData = {
//       users_id: id,
//       caption: caption,
//     };
//     let [captionData] = await conn.query(sql, insertData);

//     sql = `INSERT INTO post_images set ?`;

//     for (let i = 0; i < image.length; i++) {
//       let val = image[i];
//       let insertDataImage = {
//         posts_id: val.postsid,
//         image: image,
//       };
//       await conn.query(sql, insertDataImage);
//     }
//     await conn.commit();
//     conn.release();
//     return res.status(200).send({ message: "Posting Successfull" });
//   } catch (error) {
//     return res.status(500).send({ message: error.message || error });
//   }
// };

const posting = async (req, res) => {
  const { caption } = req.body;
  const { id } = req.user;
  let conn;
  let sql;
  console.log(req.body);
  console.log(req.user);
  console.log(req.files);

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
    return res.status(200).send({ message: "Posting Successfull" });
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

// get all post
const getpost = async (req, res) => {
  let conn, sql;

  try {
    conn = await dbCon.promise().getConnection();
    sql = `select caption,username,users_id,profilepic from posts INNER JOIN users ON posts.users_id = users.id`;

    let [result] = await conn.query(sql);
    conn.release();
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
  const { id } = req.user;
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
  postImage,
  posting,
  getpost,
  getPostById,
  deletepost,
};
