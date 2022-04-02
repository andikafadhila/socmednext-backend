const mysql = require("mysql2");

const dbCon = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "DIKA.fadhila97",
  database: "lariansosmed",
  port: 3306,
  connectionLimit: 10,
});

dbCon.getConnection((err, conn) => {
  if (err) {
    // conn.release();
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + conn.threadId);
  conn.release();
});

module.exports = dbCon;
