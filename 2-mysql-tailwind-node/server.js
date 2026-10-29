// ============================================================
// server.js  -  Express backend (REST API + serves the frontend)
// Run:  node server.js     then open  http://localhost:3000
// ============================================================
const express = require("express");
const crypto = require("crypto");
const { connectDb, db } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());                 // read JSON request bodies
app.use(express.static("public"));       // serve the files in /public (frontend)

// ---------- helpers ----------
const hash = (pw) => crypto.createHash("sha256").update(pw).digest("hex");
const validPrice = (p) => p !== "" && p !== null && Number.isFinite(Number(p)) && Number(p) > 0;
const toProduct = (r) => ({ id: r.id, name: r.name, price: Number(r.price), image: r.image });

// ============ PRODUCTS  (CRUD) ============

// READ all   GET /api/products
app.get("/api/products", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM products");
        res.json(rows.map(toProduct));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// CREATE     POST /api/products   body: { name, price, image }
app.post("/api/products", async (req, res) => {
    const { name, price, image } = req.body;
    if (!name || !name.trim() || !validPrice(price))
        return res.status(400).json({ message: "Please provide a valid product name and price" });
    try {
        const [result] = await db.query(
            "INSERT INTO products (name, price, image) VALUES (?, ?, ?)",
            [name.trim(), Number(price), image || null]);
        res.status(201).json({ id: result.insertId, name: name.trim(), price: Number(price), image });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// UPDATE     PUT /api/products/:id   body: { name, price, image }
app.put("/api/products/:id", async (req, res) => {
    const { name, price, image } = req.body;
    if (!name || !name.trim() || !validPrice(price))
        return res.status(400).json({ message: "Please provide a valid product name and price" });
    try {
        const [result] = await db.query(
            "UPDATE products SET name = ?, price = ?, image = ? WHERE id = ?",
            [name.trim(), Number(price), image || null, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated" });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE     DELETE /api/products/:id
app.delete("/api/products/:id", async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM products WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
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
        await db.query(
            "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
            [name, email, phone, hash(password)]);
        res.status(201).json({ message: "Account created", user: { name, email } });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "Email already registered" });
        res.status(500).json({ message: err.message });
    }
});

// POST /api/login    body: { email, password }
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, hash(password || "")]);
        if (rows.length === 0) return res.status(401).json({ message: "Wrong email or password" });
        res.json({ message: "Login successful", user: { name: rows[0].name, email: rows[0].email } });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// ---------- start: connect to DB first, then listen ----------
connectDb()
    .then(() => app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)))
    .catch((err) => console.error("Database connection failed:", err.code || err.message,
        "- is the database server running? Check the settings at the top of db.js"));
