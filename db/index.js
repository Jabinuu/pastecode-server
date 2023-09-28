const mysql = require("mysql");
const pool = mysql.createPool({
  host: "sh-cynosdbmysql-grp-oonk715e.sql.tencentcdb.com",
  user: "root",
  password: "JIAbin0123",
  database: "pastecode",
  port: 20102,
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
        console.log(111);

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
