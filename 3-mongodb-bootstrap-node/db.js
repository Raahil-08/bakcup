// ============================================================
// db.js  -  MongoDB connection  (the ONLY file that knows the DB)
// ============================================================
const { MongoClient } = require("mongodb");

// >>> CHANGE THESE if needed <<<
const URI = process.env.MONGO_URI || "mongodb://localhost:27017";  // MongoDB server address
const DB_NAME = process.env.DB_NAME || "mini_store";               // database nae (auto-created)

const client = new MongoClient(URI);
const db = {};   // db.products and db.users become available after connectDb()

// Called once from server.js before the server starts listening.
async function connectDb() {
    await client.connect();
    const database = client.db(DB_NAME);

    // collections (= tables) are created automatically on first insert
    db.products = database.collection("products");
    db.users = database.collection("users");

    await db.users.createIndex({ email: 1 }, { unique: true });   // no duplicate emails

    // insert sample documents the first time
    if ((await db.products.countDocuments()) === 0) {
        await db.products.insertMany([
            { name: "Headphones", price: 2000, image: "https://placehold.co/300x200?text=Headphones" },
            { name: "Bracelet", price: 600, image: "https://placehold.co/300x200?text=Bracelet" },
            { name: "Shoes", price: 3000, image: "https://placehold.co/300x200?text=Shoes" },
            { name: "Socks", price: 400, image: "https://placehold.co/300x200?text=Socks" }
        ]);
    }
    console.log("Connected to MongoDB database:", DB_NAME);
}

module.exports = { connectDb, db };
