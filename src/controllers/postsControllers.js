const { dbCon } = require("../connections");

// add image
const postImage = async (req, res) => {
  let conn, sql;
  let jalur = "/image";
  const { id } = req.user;

  console.log("ini req.files", req.files);
  console.log("ini req.body", req.body);
  const { caption } = req.body;
  const { image } = req.files;
  console.log("image", image);
  console.log("caption", caption);
  const imagearrpath = image
    ? image.map((val) => {
        return `${jalur}/${val.filename}`;
      })
    : [];

  console.log("ini imagearrpath", imagearrpath);

  // const imagePath = req.file ? `${path}/${req.file.filename}` : null;
  if (!image) {
    return res.status(500).send({ message: "foto tidak ada" });
  }

  try {
    conn = await dbCon.promise().getConnection();

    await conn.beginTransaction();
    // insert into posts table
    sql = `INSERT INTO posts SET ?`;
    let datacaption = {
      caption: caption,
      users_id: id,
    };
    let [result] = await conn.query(sql, datacaption);
    console.log(result.insertId);

    let posts_id = result.insertId;
    // console.log("posts_id", posts_id);

    // insert into  posts_images
    sql = `INSERT INTO posts_images set ?`;

    for (let i = 0; i < imagearrpath.length; i++) {
      let insertDataImage = {
        image: imagearrpath[i],
        posts_id: posts_id,
      };
      await conn.query(sql, insertDataImage);
    }

    conn.commit();
    conn.release();
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
  let { page, limit } = req.query;

  // initialize offSet limit
  if (!page) {
    page = 0;
  }
  if (!limit) {
    limit = 10;
  }
  let offset = page * limit;

  // jadiin INT
  limit = parseInt(limit);
  try {
    conn = await dbCon.promise().getConnection();
    // ini ngeGet table posts && users && likes && kasih limit
    sql = `select posts.id,caption,username,users_id,profilepic, (SELECT count(*) FROM likes WHERE posts_id = posts.id) as number_of_likes from posts INNER JOIN users ON posts.users_id = users.id ORDER BY posts.createdAt DESC LIMIT ${dbCon.escape(
      offset
    )}, ${dbCon.escape(limit)}`;
    let [result] = await conn.query(sql);

    sql = `SELECT * FROM posts_images WHERE posts_id = ?`;
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const [resultImage] = await conn.query(sql, element.id);

      console.log("ini resultImage", resultImage);
      result[i] = { ...result[i], photos: resultImage };
    }

    sql = `SELECT COUNT(*) as total_posts FROM posts`;
    let [totalPosts] = await conn.query(sql);

    console.log("iniresult", result);
    conn.release();
    res.set("x-total-count", totalPosts[0].total_posts);
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