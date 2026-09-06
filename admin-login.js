const API_URL = "http://localhost:8080/api/admin/login";
const adminLoginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

adminLoginForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    loginMessage.textContent = "Checking login...";
    loginMessage.style.color = "#d4af37";
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok && data.success) {
            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "#4CAF50";
            sessionStorage.setItem("adminLoggedIn", "true");
            setTimeout(() => { window.location.href = "admin.html"; }, 500);
        } else {
            loginMessage.textContent = data.message || "Invalid username or password.";
            loginMessage.style.color = "#ff5252";
        }
    } catch (error) {
        console.error("Admin login error:", error);
        loginMessage.textContent = "Unable to connect to server.";
        loginMessage.style.color = "#ff5252";
    }
});
