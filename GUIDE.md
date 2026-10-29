# Mini Store – Exam Templates (4 combinations)

| Folder | Database | CSS framework |
|---|---|---|
| `1-mysql-bootstrap`   | MySQL   | Bootstrap 5 |
| `2-mysql-tailwind`    | MySQL   | Tailwind    |
| `3-mongodb-bootstrap` | MongoDB | Bootstrap 5 |
| `4-mongodb-tailwind`  | MongoDB | Tailwind    |

Every site does the same things (same as your mini-store practical, plus the DB):
**list products from DB · add · edit · delete · search · cart counter (localStorage) · drag-and-drop to cart · geolocation · signup (validated, saved in DB) · login.**

---------------------------------------------------------------------

## 1. How the pieces connect (learn this picture)

```
Browser (public/index.html + script.js)
      │  fetch("/api/products")   <- HTTP request (JSON)
      ▼
Express server (server.js)        <- routes: GET/POST/PUT/DELETE
      │  db.query(...)  or  db.products.find(...)
      ▼
Database (db.js holds the connection)   MySQL  or  MongoDB
```

* **Frontend → backend**: `fetch()` in `script.js`.
* **Backend → database**: the driver (`mysql2` / `mongodb`) set up in `db.js`.
* **One server does everything**: `express.static("public")` serves the HTML, so there is
  no CORS problem and you only run **one** command.

### Files in every project
| File | Job | Touch it when… |
|---|---|---|
| `db.js` | connect to DB, create tables/collections, seed data | DB password/name changes, new fields |
| `server.js` | the REST API (routes + validation) | new entity / new fields / new routes |
| `public/index.html` | page layout, add/edit form | new fields in the form, new text |
| `public/script.js` | fetch calls + drawing cards | new fields, card design |
| `public/login.html/.js` | signup + login | rarely |
| `schema.sql` (MySQL only) | the same tables as plain SQL | optional |

---------------------------------------------------------------------

## 2. One-time installs (Windows)

* **Node.js** – already installed (`node -v`).
* **MySQL** (for templates 1 & 2): install *MySQL Community Server* (MySQL Installer) or XAMPP.
  Remember the **root password** you set. Check it runs: open *Services* → `MySQL80` = Running
  (XAMPP: press *Start* next to MySQL).
* **MongoDB** (for templates 3 & 4): install *MongoDB Community Server*, tick
  **"Install as a Service"** – it then runs on `mongodb://localhost:27017` automatically.
  (Optional: MongoDB Compass to look at the data.)

---------------------------------------------------------------------

## 3. Run a template (3 commands)

```powershell
cd exam-templates\1-mysql-bootstrap     # pick any folder
npm install                              # downloads express + the DB driver
node server.js                           # starts the site
```
Open **http://localhost:3000**. Database, tables and 4 sample products are created automatically.

**MySQL only** – open `db.js` and set your password:
```js
password: process.env.DB_PASSWORD || "YOUR_PASSWORD_HERE",
```
Success looks like:
```
Connected to MySQL database: mini_store
Server running at http://localhost:3000
```
(MongoDB prints `Connected to MongoDB database: mini_store`.)

Stop the server with **Ctrl + C**. Run only one template at a time (they all use port 3000;
or set another port: `$env:PORT=3001; node server.js`).

---------------------------------------------------------------------

## 4. Building it FROM SCRATCH in the exam (what you type)

```powershell
mkdir my-site ; cd my-site
npm init -y
npm install express mysql2          # MySQL version
# npm install express mongodb       # MongoDB version
mkdir public                         # put index.html, script.js here
```
Then create `db.js` and `server.js` (copy from a template – they are short) and run `node server.js`.

### The 4 lines that make the connection

**MySQL (`db.js`)**
```js
const mysql = require("mysql2/promise");
const pool = mysql.createPool({ host:"localhost", user:"root", password:"YOURPASS", database:"mini_store" });
// use:  const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
```
**MongoDB (`db.js`)**
```js
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");
await client.connect();
const products = client.db("mini_store").collection("products");
// use:  const docs = await products.find().toArray();
```

### CRUD cheat-sheet (same 4 actions, two languages)
| Action | HTTP route | MySQL | MongoDB |
|---|---|---|---|
| Create | `POST /api/products` | `INSERT INTO products (name,price) VALUES (?,?)` | `products.insertOne({name,price})` |
| Read   | `GET /api/products`  | `SELECT * FROM products` | `products.find().toArray()` |
| Update | `PUT /api/products/:id` | `UPDATE products SET name=?,price=? WHERE id=?` | `products.updateOne({_id:new ObjectId(id)},{$set:{name,price}})` |
| Delete | `DELETE /api/products/:id` | `DELETE FROM products WHERE id=?` | `products.deleteOne({_id:new ObjectId(id)})` |

Always use `?` placeholders in SQL (never paste user text into the query – SQL injection).
MongoDB's id is `_id` (an ObjectId). The templates send it to the browser as `id`, so the
frontend code is **identical** for MySQL and MongoDB.

---------------------------------------------------------------------

## 5. Converting the site to ANY other theme (e.g. Books, Movies, Students)

Say the examiner wants **"Library – books with title, author, price"**. Change only these:

1. **`db.js`** – table/collection name `products`→`books`; columns `name,price,image`→`title,author,price`;
   update the seed rows.
   *(MySQL: edit the `CREATE TABLE`. MongoDB: nothing to create – just use new field names.)*
2. **`server.js`** – find/replace `products`→`books` and `/api/products`→`/api/books`; in POST/PUT change
   `{ name, price, image }`→`{ title, author, price }`, the validation, and the SQL columns / `toProduct()` mapper.
3. **`public/index.html`** – change the form inputs (`pName`, `pPrice`, `pImage`) to the new fields, plus headings/text.
4. **`public/script.js`** – change `API = "/api/books"`, the `body` object in the form submit,
   the edit-fill lines, and `cardHTML()` (what a card shows). Search filters by `p.title` instead of `p.name`.

Tip: use VS Code **Ctrl+Shift+H** (find & replace across file) – `products`→`books`, `product`→`book`.

### Switching the other two axes
* **MySQL ↔ MongoDB**: swap `db.js` and the 4 route handlers in `server.js` (everything else is the same – copy from the other template).
* **Bootstrap ↔ Tailwind**: swap `<link>`/`<script>` in the HTML `<head>`, the classes in the HTML,
  and the classes inside `cardHTML()` in `script.js`. No backend change.
  * Bootstrap CDN: `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">`
  * Tailwind CDN:   `<script src="https://cdn.tailwindcss.com"></script>`

### Adding extras examiners like
* **New page**: create `public/about.html`, link with `<a href="about.html">`.
* **Another table** (e.g. `orders`): copy one block of routes in `server.js`, change names.
* **Role/admin only delete**: see Practical 9 middleware idea – add `if (req.headers.role !== "admin") return res.status(403)...`.

---------------------------------------------------------------------

## 6. Troubleshooting

| Message | Meaning / fix |
|---|---|
| `ECONNREFUSED` | DB server isn't running. Start MySQL service / MongoDB service. |
| `ER_ACCESS_DENIED_ERROR` | Wrong MySQL user/password in `db.js`. |
| `Client does not support authentication protocol` | Use `mysql2` (not `mysql`) – templates already do. |
| `EADDRINUSE :3000` | Port busy – stop the other server (Ctrl+C) or use another `PORT`. |
| `Cannot find module 'express'` | You forgot `npm install` in that folder. |
| Page loads but no products | Open browser DevTools (F12) → Console/Network; check `/api/products` response. |
| `Cannot GET /` | You started the server in the wrong folder – `public/index.html` must exist next to `server.js`. |
| Edit/Delete does nothing on Mongo | id isn't a valid ObjectId – check you send `p.id` from the API. |

Test the API without the frontend: open **http://localhost:3000/api/products** in the browser – you should see JSON.

---------------------------------------------------------------------

## 7. Security note (for your viva)

Passwords are stored as a SHA-256 hash (not plain text), which is fine for a practical.
A real app would use **bcrypt** (salted, slow) and **JWT/sessions** for staying logged in.
