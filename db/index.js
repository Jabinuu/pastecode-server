const mysql = require("mysql");
const pool = mysql.createPool({
  host: "sh-cynosdbmysql-grp-gl7zu3u8.sql.tencentcdb.com:21038",
  user: "root",
  password: "DSt7zTmp",
  database: "pastecode",
});

// const pool = mysql.createPool({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "codepaste",
// });

let query = function (sql, values) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) {
        reject(err);
      } else {
        connection.query(sql, values, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

module.exports = { query };
