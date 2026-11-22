require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Check the connection at startup, but don't kill the server if it fails.
// The chat keeps working; only the /users routes return an error until the DB is fixed.
pool.getConnection().then((connection)=>{
  console.log("DB connection established");
  connection.release();
}).catch ((er)=>{
  console.warn("DB connection failed (chat still works, /users routes won't): ", er.message);
});

module.exports = pool;
