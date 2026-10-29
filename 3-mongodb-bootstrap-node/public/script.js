// ============================================================
// script.js  -  frontend logic (talks to the backend with fetch)
// ============================================================
const API = "/api/products";          // backend address (same server, so no host needed)
let products = [];                    // all products from the database
let editingId = null;                 // null = adding, otherwise the id being edited

const grid = document.getElementById("products");

// ---------- small helpers ----------
const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function showMessage(text, type = "danger") {
    document.getElementById("message").innerHTML =
        text ? `<div class="alert alert-${type} py-2 mb-0">${esc(text)}</div>` : "";
}

// ---------- READ: get products from backend and draw them ----------
async function loadProducts() {
    try {
        const res = await fetch(API);
        products = await res.json();
        render();
    } catch (err) {
        grid.innerHTML = `<p class="text-danger text-center">Could not load products. Is the server running?</p>`;
    }
}

// HTML of ONE product card  <-- change this to change how items look
function cardHTML(p) {
    return `
    <div class="col-md-6 col-lg-3 mb-3">
        <div class="card h-100 p-3" draggable="true" data-name="${esc(p.name)}">
            <img src="${esc(p.image || "")}" class="card-img-top" alt="${esc(p.name)}"
                 onerror="this.src='https://placehold.co/300x200?text=No+Image'">
            <h3 class="h5 mt-2">${esc(p.name)}</h3>
            <p>price: ₹${p.price}</p>
            <button class="btn btn-dark mb-2" data-action="cart">add to cart</button>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-secondary btn-sm flex-fill" data-action="edit" data-id="${esc(p.id)}">edit</button>
                <button class="btn btn-outline-danger btn-sm flex-fill" data-action="delete" data-id="${esc(p.id)}">delete</button>
            </div>
        </div>
    </div>`;
}

function render() {
    const text = document.getElementById("search").value.toLowerCase();
    const list = products.filter((p) => p.name.toLowerCase().includes(text));   // SEARCH
    grid.innerHTML = list.length ? list.map(cardHTML).join("") : `<p class="text-center">No products found</p>`;
}

document.getElementById("search").addEventListener("input", render);

// ---------- CREATE / UPDATE: form submit ----------
document.getElementById("productForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {
        name: document.getElementById("pName").value,
        price: document.getElementById("pPrice").value,
        image: document.getElementById("pImage").value
    };
    const url = editingId ? `${API}/${editingId}` : API;
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) return showMessage(data.message);

    resetForm();
    loadProducts();
});

function resetForm() {
    editingId = null;
    document.getElementById("productForm").reset();
    document.getElementById("formTitle").textContent = "Add a product";
    document.getElementById("saveBtn").textContent = "add";
    document.getElementById("cancelBtn").classList.add("d-none");
    showMessage("");
}
document.getElementById("cancelBtn").addEventListener("click", resetForm);

// ---------- buttons inside the cards (one listener for all cards) ----------
grid.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const id = btn.dataset.id;

    if (btn.dataset.action === "cart") addToCart();

    if (btn.dataset.action === "edit") {                        // fill the form
        const p = products.find((x) => String(x.id) === id);
        editingId = id;
        document.getElementById("pName").value = p.name;
        document.getElementById("pPrice").value = p.price;
        document.getElementById("pImage").value = p.image || "";
        document.getElementById("formTitle").textContent = "Edit product";
        document.getElementById("saveBtn").textContent = "update";
        document.getElementById("cancelBtn").classList.remove("d-none");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (btn.dataset.action === "delete") {                      // DELETE
        if (!confirm("Delete this product?")) return;
        await fetch(`${API}/${id}`, { method: "DELETE" });
        loadProducts();
    }
});

// ---------- CART (stored in the browser with localStorage) ----------
let count = Number(localStorage.getItem("cartCount")) || 0;
const cartBadge = document.getElementById("cart");
cartBadge.textContent = "cart: " + count;

function addToCart() {
    count++;
    cartBadge.textContent = "cart: " + count;
    localStorage.setItem("cartCount", count);
}
document.getElementById("clearCartBtn").addEventListener("click", () => {
    count = 0;
    cartBadge.textContent = "cart: 0";
    localStorage.setItem("cartCount", 0);
});

// ---------- DRAG & DROP ----------
grid.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".card");
    if (card) e.dataTransfer.setData("text", card.dataset.name);
});
const dropZone = document.getElementById("dropZone");
dropZone.addEventListener("dragover", (e) => e.preventDefault());       // allow dropping
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    alert(e.dataTransfer.getData("text") + " added to cart!");
    addToCart();
});

// ---------- GEOLOCATION ----------
document.getElementById("locationBtn").addEventListener("click", () => {
    navigator.geolocation.getCurrentPosition(
        (pos) => document.getElementById("locationResult").textContent =
            `latitude: ${pos.coords.latitude}, longitude: ${pos.coords.longitude}`,
        () => document.getElementById("locationResult").textContent = "unable to get location"
    );
});

// ---------- LOGIN STATE in navbar ----------
const userName = localStorage.getItem("name");
document.getElementById("userBox").innerHTML = userName
    ? `<span>Hi, ${esc(userName)}</span> <button class="btn btn-sm btn-outline-dark ms-2" id="logoutBtn">logout</button>`
    : `<a class="nav-link" href="login.html">Login / Sign up</a>`;
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    location.reload();
});

loadProducts();   // run once when the page opens
