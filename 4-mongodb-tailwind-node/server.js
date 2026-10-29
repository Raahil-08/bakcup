// ============================================================
// server.js  -  Express backend (REST API + serves the frontend)
// Run:  node server.js     then open  http://localhost:3000
// ============================================================
const express = require("express");
const crypto = require("crypto");
const { ObjectId } = require("mongodb");
const { connectDb, db } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());                 // read JSON request bodies
app.use(express.static("public"));       // serve the files in /public (frontend)

// ---------- helpers ----------
const hash = (pw) => crypto.createHash("sha256").update(pw).digest("hex");
const validPrice = (p) => p !== "" && p !== null && Number.isFinite(Number(p)) && Number(p) > 0;
// MongoDB calls the key "_id"; we send "id" so the frontend is identical for MySQL and MongoDB
const toProduct = (d) => ({ id: d._id.toString(), name: d.name, price: d.price, image: d.image });

// ============ PRODUCTS  (CRUD) ============

// READ all   GET /api/products
app.get("/api/products", async (req, res) => {
    try {
        const docs = await db.products.find().toArray();
        res.json(docs.map(toProduct));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE     POST /api/products   body: { name, price, image }
app.post("/api/products", async (req, res) => {
    const { name, price, image } = req.body;
    if (!name || !name.trim() || !validPrice(price))
        return res.status(400).json({ message: "Please provide a valid product name and price" });
    try {
        const doc = { name: name.trim(), price: Number(price), image: image || null };
        const result = await db.products.insertOne(doc);
        res.status(201).json(toProduct({ ...doc, _id: result.insertedId }));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE     PUT /api/products/:id   body: { name, price, image }
app.put("/api/products/:id", async (req, res) => {
    const { name, price, image } = req.body;
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid id" });
    if (!name || !name.trim() || !validPrice(price))
        return res.status(400).json({ message: "Please provide a valid product name and price" });
    try {
        const result = await db.products.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { name: name.trim(), price: Number(price), image: image || null } });
        if (result.matchedCount === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE     DELETE /api/products/:id
app.delete("/api/products/:id", async (req, res) => {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid id" });
    try {
        const result = await db.products.deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ============ USERS  (signup + login) ============

// POST /api/signup   body: { name, email, phone, password }
app.post("/api/signup", async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
        return res.status(400).json({ message: "All fields are required" });
    try {
        await db.users.insertOne({ name, email, phone, password: hash(password) });
        res.status(201).json({ message: "Account created", user: { name, email } });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ message: "Email already registered" });
        res.status(500).json({ message: err.message });
    }
});

// POST /api/login    body: { email, password }
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.users.findOne({ email, password: hash(password || "") });
        if (!user) return res.status(401).json({ message: "Wrong email or password" });
        res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---------- start: connect to DB first, then listen ----------
connectDb()
    .then(() => app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)))
    .catch((err) => console.error("Database connection failed:", err.code || err.message,
        "- is the database server running? Check the settings at the top of db.js"));
