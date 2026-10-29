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

function showMessage(text) {
    document.getElementById("message").innerHTML =
        text ? `<div class="bg-red-100 text-red-700 rounded px-3 py-2">${esc(text)}</div>` : "";
}

// ---------- READ: get products from backend and draw them ----------
async function loadProducts() {
    try {
        const res = await fetch(API);
        products = await res.json();
        render();
    } catch (err) {
        grid.innerHTML = `<p class="text-red-600 text-center col-span-full">Could not load products. Is the server running?</p>`;
    }
}

// HTML of ONE product card  <-- change this to change how items look
function cardHTML(p) {
    return `
    <div class="card bg-white rounded-xl shadow p-4 flex flex-col" draggable="true" data-name="${esc(p.name)}">
        <img src="${esc(p.image || "")}" alt="${esc(p.name)}" class="h-44 w-full object-cover rounded"
             onerror="this.src='https://placehold.co/300x200?text=No+Image'">
        <h3 class="text-lg font-semibold mt-2">${esc(p.name)}</h3>
        <p class="mb-3">price: ₹${p.price}</p>
        <button class="bg-gray-900 text-white rounded py-2 mb-2 hover:bg-gray-700" data-action="cart">add to cart</button>
        <div class="flex gap-2 mt-auto">
            <button class="flex-1 border rounded py-1 text-sm hover:bg-gray-100" data-action="edit" data-id="${esc(p.id)}">edit</button>
            <button class="flex-1 border border-red-500 text-red-500 rounded py-1 text-sm hover:bg-red-500 hover:text-white" data-action="delete" data-id="${esc(p.id)}">delete</button>
        </div>
    </div>`;
}

function render() {
    const text = document.getElementById("search").value.toLowerCase();
    const list = products.filter((p) => p.name.toLowerCase().includes(text));   // SEARCH
    grid.innerHTML = list.length ? list.map(cardHTML).join("") : `<p class="text-center col-span-full">No products found</p>`;
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
    document.getElementById("cancelBtn").classList.add("hidden");
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
        document.getElementById("cancelBtn").classList.remove("hidden");
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
    ? `<span>Hi, ${esc(userName)}</span> <button id="logoutBtn" class="ml-2 border border-gray-900 text-sm px-3 py-1 rounded hover:bg-gray-900 hover:text-white">logout</button>`
    : `<a class="hover:underline" href="login.html">Login / Sign up</a>`;
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    location.reload();
});

loadProducts();   // run once when the page opens
