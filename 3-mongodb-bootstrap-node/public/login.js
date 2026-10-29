// ============================================================
// login.js  -  signup (with validation) + login, using the backend
// ============================================================
async function post(url, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    return { ok: res.ok, data: await res.json() };
}

// ---------- SIGN UP ----------
document.getElementById("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("terms").checked;

    // frontend validation
    if (!email.includes("@")) return alert("email must contain @");
    if (!/^\d{10}$/.test(phone)) return alert("phone number must contain exactly 10 digits");
    if (password.length < 6) return alert("password must contain at least 6 characters");
    if (password !== confirmPassword) return alert("password not matching");
    if (!terms) return alert("please agree to terms and conditions");

    // send to backend -> saved in the database
    const { ok, data } = await post("/api/signup", { name, email, phone, password });
    if (!ok) return alert(data.message);

    localStorage.setItem("name", data.user.name);
    localStorage.setItem("email", data.user.email);
    alert("Account created!");
    location.href = "index.html";
});

// ---------- LOGIN ----------
document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { ok, data } = await post("/api/login", { email, password });
    if (!ok) return alert(data.message);

    localStorage.setItem("name", data.user.name);
    localStorage.setItem("email", data.user.email);
    location.href = "index.html";
});
