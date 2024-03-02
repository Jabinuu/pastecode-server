const mysql = require("mysql");
const pool = mysql.createPool({
  host: "sh-cynosdbmysql-grp-p7pgfvyu.sql.tencentcdb.com",
  user: "root",
  password: "JIAbin123",
  database: "pastecode",
  port: 21066,
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
