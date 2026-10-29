// ============================================================
// db.js  -  MySQL connection  (the ONLY file that knows the DB)
// ============================================================
const mysql = require("mysql2/promise");

// >>> CHANGE THESE to match your MySQL install <<<
const CONFIG = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",      // your MySQL root password
    database: process.env.DB_NAME || "mini_store" // database name
};

let pool;

// Called once from server.js before the server starts listening.
async function connectDb() {
    // 1. connect WITHOUT a database and create it if missing
    const boot = await mysql.createConnection({
        host: CONFIG.host, user: CONFIG.user, password: CONFIG.password
    });
    await boot.query(`CREATE DATABASE IF NOT EXISTS \`${CONFIG.database}\``);
    await boot.end();

    // 2. now connect to that database (a pool = reusable connections)
    pool = mysql.createPool({ ...CONFIG, waitForConnections: true, connectionLimit: 10 });

    // 3. create tables if missing   (same SQL is in database/schema.sql)
    await pool.query(`CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image VARCHAR(500)
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(15) NOT NULL,
        password VARCHAR(200) NOT NULL
    )`);

    // 4. insert sample rows the first time
    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM products");
    if (total === 0) {
        await pool.query("INSERT INTO products (name, price, image) VALUES ?", [[
            ["Headphones", 2000, "https://placehold.co/300x200?text=Headphones"],
            ["Bracelet", 600, "https://placehold.co/300x200?text=Bracelet"],
            ["Shoes", 3000, "https://placehold.co/300x200?text=Shoes"],
            ["Socks", 400, "https://placehold.co/300x200?text=Socks"]
        ]]);
    }
    console.log("Connected to MySQL database:", CONFIG.database);
}

// db.query("SELECT ...", [values])  ->  [rows, fields]
const db = { query: (sql, params) => pool.query(sql, params) };

module.exports = { connectDb, db };
