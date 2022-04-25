const { dbCon } = require("./../connections");

const getUser = async (req, res) => {
  const { id } = req.user;
  let conn, sql;

  if (!id) {
    throw { message: "not authorized" };
  }

  try {
    conn = await dbCon.promise();
    sql = `SELECT * FROM users WHERE id = ?`;
    let [result] = await conn.query(sql, id);
    return res.status(200).send(result[0]);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
};

// const getUserbyId = async(req,res) => {
//   const {}
// }

module.exports = {
  getUser,
};
