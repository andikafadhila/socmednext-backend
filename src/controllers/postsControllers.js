const { dbCon } = require("../connections");
const fs = require("fs");

// postImage and caption
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
    conn.rollback();
    if (imagearrpath) {
      // klo foto sudah terupload dan sql ggaal maka fotonya dihapus
      for (let i = 0; i < imagearrpath.length; i++) {
        fs.unlinkSync("./public" + imagearrpath[i]);
      }
    }
    return res.status(500).send({ message: error.message || error });
  }
};

// get all post
const getpost = async (req, res) => {
  let conn, sql;
  let { id } = req.user;
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
    sql = `select posts.id,caption,username,users_id,profilepic,posts.createdAt, if(id_like is null, 0, 1) as udah_like, (SELECT count(*) FROM likes WHERE posts_id = posts.id) as number_of_likes from posts INNER JOIN users ON posts.users_id = users.id LEFT JOIN (SELECT id as id_like, posts_id FROM likes WHERE users_id = ${id}) as l ON posts.id = l.posts_id ORDER BY posts.createdAt DESC LIMIT ${dbCon.escape(
      offset
    )}, ${dbCon.escape(limit)}`;
    let [result] = await conn.query(sql);

    // ini ngeloop image yang di upload
    sql = `SELECT * FROM posts_images WHERE posts_id = ?`;
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const [resultImage] = await conn.query(sql, element.id);

      console.log("ini resultImage", resultImage);
      result[i] = { ...result[i], photos: resultImage };
    }

    //ini ngeloop comment yang di post
    sql = `SELECT comment,posts_id, users_id, comments.createdAt, username, profilepic FROM comments JOIN users ON users_id = users.id WHERE posts_id = ?`;
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const [resultComments] = await conn.query(sql, element.id);

      console.log("ini resultComments", resultComments);
      result[i] = { ...result[i], comments: resultComments };
    }

    // total posts
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

// get post by User id
const getPostById = async (req, res) => {
  let conn, sql;
  let { id } = req.user;
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
    sql = `select posts.id,caption,username,users_id,profilepic,posts.createdAt, if(id_like is null, 0, 1) as udah_like, (SELECT count(*) FROM likes WHERE posts_id = posts.id) as number_of_likes from posts INNER JOIN users ON posts.users_id = users.id LEFT JOIN (SELECT id as id_like, posts_id FROM likes WHERE users_id = ${id}) as l ON posts.id = l.posts_id WHERE users.id = ${id} ORDER BY posts.createdAt DESC LIMIT ${dbCon.escape(
      offset
    )}, ${dbCon.escape(limit)}`;
    let [result] = await conn.query(sql);

    // ini ngeloop image yang di upload
    sql = `SELECT * FROM posts_images WHERE posts_id = ?`;
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const [resultImage] = await conn.query(sql, element.id);

      console.log("ini resultImage", resultImage);
      result[i] = { ...result[i], photos: resultImage };
    }

    //ini ngeloop comment yang di post
    sql = `SELECT comment,posts_id, users_id, comments.createdAt, username, profilepic FROM comments JOIN users ON users_id = users.id WHERE posts_id = ?`;
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const [resultComments] = await conn.query(sql, element.id);

      console.log("ini resultComments", resultComments);
      result[i] = { ...result[i], comments: resultComments };
    }

    // total posts
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

// get post by Post id
const getPostByPostId = async (req, res) => {
  let conn, sql;
  let { id } = req.user;
  let { postId } = req.query;

  // jadiin INT
  try {
    conn = await dbCon.promise().getConnection();
    // ini ngeGet table posts && users && likes && kasih limit
    sql = `select posts.id,caption,username,users_id,profilepic,posts.createdAt, if(id_like is null, 0, 1) as already_like, (SELECT count(*) FROM likes WHERE posts_id = posts.id) as number_of_likes FROM posts INNER JOIN users ON posts.users_id = users.id LEFT JOIN (SELECT id as id_like, posts_id FROM likes WHERE users_id = ${id}) as l ON posts.id = l.posts_id WHERE posts.id = ${postId}`;
    let [result] = await conn.query(sql);

    // ini ngeloop image yang di upload
    sql = `SELECT * FROM posts_images WHERE posts_id = ?`;
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const [resultImage] = await conn.query(sql, element.id);

      console.log("ini resultImage", resultImage);
      result[i] = { ...result[i], photos: resultImage };
    }

    //ini ngeloop comment yang di post
    sql = `SELECT comment,posts_id, users_id, comments.createdAt, username, profilepic FROM comments JOIN users ON users_id = users.id WHERE posts_id = ? ORDER BY comments.createdAt DESC`;
    for (let i = 0; i < result.length; i++) {
      const element = result[i];
      const [resultComments] = await conn.query(sql, element.id);

      console.log("ini resultComments", resultComments);
      result[i] = { ...result[i], comments: resultComments };
    }

    // total posts
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

// cek

const cek = async (req, res) => {
  const { id } = req.user;
  const { posts_id } = req.query;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `SELECT * FROM posts_images WHERE posts_id = ?`;
    const [result] = await conn.query(sql, posts_id);
    console.log(result);
    conn.release();
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

// delete post
const deletepost = async (req, res) => {
  const { id } = req.user;
  const { posts_id } = req.query;
  //post id nya, image nya, comment nya, like nya

  try {
    conn = await dbCon.promise().getConnection();
    await conn.beginTransaction();

    sql = `SELECT * FROM posts_images WHERE posts_id = ?`;
    const [result] = await conn.query(sql, posts_id);

    sql = `DELETE FROM comments WHERE posts_id = ?`;
    await conn.query(sql, posts_id);

    sql = `DELETE FROM likes WHERE posts_id = ?`;
    await conn.query(sql, posts_id);

    sql = `DELETE FROM posts_images WHERE posts_id = ?`;
    await conn.query(sql, posts_id);

    // delete postsnya belakangan
    sql = `DELETE FROM posts WHERE id = ?`;
    await conn.query(sql, posts_id);

    if (result.length) {
      for (let i = 0; i < result.length; i++) {
        fs.unlinkSync("./public" + result[i].image);
      }
    }

    conn.release();
    conn.commit();
    return res.status(200).send({ message: "successfull to delete post" });
  } catch (error) {
    conn.rollback();
    conn.release();
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

// like a post
const likepost = async (req, res) => {
  let sql, conn;
  let { id } = req.user;
  let { posts_id } = req.query;
  posts_id = parseInt(posts_id);
  console.log("id", id);
  console.log("posts_id", posts_id);
  console.log("req.query", req.query);

  try {
    conn = await dbCon.promise().getConnection();

    // cek udah di like apa blom post nya
    sql = `SELECT * FROM posts INNER JOIN likes ON likes.posts_id = posts.id WHERE posts.id = ? AND likes.users_id = ?`;
    const [resultLiked] = await conn.query(sql, [posts_id, id]);
    if (resultLiked.length) {
      sql = `DELETE FROM likes WHERE posts_id = ? AND users_id = ?`;
      const [deleteResult] = await conn.query(sql, [posts_id, id]);
      conn.release();
      return res.status(200).send({ message: "Unliked!" });
    }

    sql = `INSERT INTO likes set ?`;
    let inputData = {
      posts_id,
      users_id: id,
    };

    const [resultLike] = await conn.query(sql, inputData);
    conn.release();
    return res.status(200).send({ message: "Liked!" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

// create a comment
const commentpost = async (req, res) => {
  let conn, sql;
  const { id } = req.user;
  const { comment } = req.body;
  const { posts_id } = req.query;

  try {
    conn = await dbCon.promise().getConnection();

    if (comment.length > 300) {
      throw { message: "Maximum character allowed is 300." };
    }

    sql = `INSERT INTO comments set ?`;
    let inputComments = {
      users_id: id,
      comment,
      posts_id,
    };

    const [result] = await conn.query(sql, inputComments);
    conn.release();
    return res.status(200).send({ message: "comment successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

// delete a comment
const deletecommentpost = async (req, res) => {
  let conn, sql;
  const { id: users_id } = req.user;
  const { id } = req.query;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `DELETE FROM comments where id = ? AND users_id = ?`;
    const [result] = await conn.query(sql, [id, users_id]);

    conn.release();
    return res.status(200).send({ message: "comment deleted" });
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

//edit comment
const editcomment = async (req, res) => {
  let conn, sql;
  const { id } = req.user;
  const { comment } = req.body;
  const { id_posts, id: comments_id } = req.query;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `SELECT * FROM comments WHERE users_id = ? AND posts_id = ? AND id = ?`;
    const [resultcomments] = await conn.query(sql, [id, id_posts, comments_id]);

    if (!resultcomments.length) {
      throw { message: "ini bukan comment anda!" };
    }

    sql = `UPDATE comments set ? WHERE posts_id = ? AND id = ?`;
    let inputComment = {
      comment,
    };
    const [result] = await conn.query(sql, [
      inputComment,
      id_posts,
      comments_id,
    ]);
    conn.release();
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

// editpost
const editpost = async (req, res) => {
  let conn, sql;
  const { id } = req.user;
  const { caption } = req.body;
  const { id_posts } = req.query;

  try {
    conn = await dbCon.promise().getConnection();

    sql = `SELECT * FROM posts WHERE users_id = ? AND id = ?`;
    const [resultPost] = await conn.query(sql, [id, id_posts]);

    if (!resultPost.length) {
      throw { message: "ini bukan post anda!" };
    }

    sql = `UPDATE posts set ? WHERE id = ?`;
    let inputCaption = {
      caption,
    };
    const [result] = await conn.query(sql, [inputCaption, id_posts]);
    conn.release();
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

module.exports = {
  postImage,
  getpost,
  getPostById,
  deletepost,
  likepost,
  commentpost,
  deletecommentpost,
  cek,
  editcomment,
  editpost,
  getPostByPostId,
};
