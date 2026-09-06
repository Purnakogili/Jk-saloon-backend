const API_URL = "https://jk-saloon-backend-n69q.onrender.com/api/appointments";
const PACKAGE_PRICES = {
    "basic": 199,
    "classic": 299,
    "premium": 499,
    "royal": 699
};

function adminLogout() {
    sessionStorage.removeItem("adminLoggedIn");
    window.location.href = "admin-login.html";
}

function getPackagePrice(packageName) {
    if (!packageName) return 0;
    const key = packageName.trim().toLowerCase().replace(" package", "").trim();
    return PACKAGE_PRICES[key] || 0;
}

function getTodayIndia() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(new Date());
}

function formatMoney(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function statusClass(status) {
    const value = (status || "BOOKED").toLowerCase();
    return value === "completed" ? "completed" : value === "cancelled" ? "cancelled" : "booked";
}

function updateCards(appointments) {
    const total = appointments.length;
    const booked = appointments.filter(a => a.status === "BOOKED").length;
    const completed = appointments.filter(a => a.status === "COMPLETED").length;
    const cancelled = appointments.filter(a => a.status === "CANCELLED").length;

    // Earnings: booked + completed, cancelled excluded.
    const earningAppointments = appointments.filter(
        a => a.status === "BOOKED" || a.status === "COMPLETED"
    );
    const totalEarnings = earningAppointments.reduce(
        (sum, a) => sum + getPackagePrice(a.packageName), 0
    );

    const today = getTodayIndia();
    const todayEarnings = earningAppointments
        .filter(a => a.appointmentDate === today)
        .reduce((sum, a) => sum + getPackagePrice(a.packageName), 0);

    document.getElementById("totalCount").textContent = total;
    document.getElementById("bookedCount").textContent = booked;
    document.getElementById("completedCount").textContent = completed;
    document.getElementById("cancelledCount").textContent = cancelled;
    document.getElementById("totalEarnings").textContent = formatMoney(totalEarnings);
    document.getElementById("todayEarnings").textContent = formatMoney(todayEarnings);
}

function renderAppointments(appointments) {
    const table = document.getElementById("appointmentTable");
    table.innerHTML = "";

    if (!appointments.length) {
        table.innerHTML = `<tr><td colspan="10" class="empty">No appointments found.</td></tr>`;
        return;
    }

    appointments.forEach(appointment => {
        const row = document.createElement("tr");
        const price = getPackagePrice(appointment.packageName);
        const status = appointment.status || "BOOKED";
        const statusCss = statusClass(status);

        row.innerHTML = `
            <td>#${appointment.id ?? "-"}</td>
            <td><strong>${escapeHtml(appointment.customerName)}</strong></td>
            <td>${escapeHtml(appointment.phone)}</td>
            <td>${escapeHtml(appointment.styleName)}</td>
            <td>${escapeHtml(appointment.packageName)}</td>
            <td>${escapeHtml(appointment.appointmentDate)}</td>
            <td>${escapeHtml(appointment.appointmentTime)}</td>
            <td class="price">${formatMoney(price)}</td>
            <td><span class="status ${statusCss}">${escapeHtml(status)}</span></td>
            <td class="action-cell">
                <button class="action-btn complete" onclick="updateStatus(${appointment.id}, 'COMPLETED')">Complete</button>
                <button class="action-btn cancel" onclick="updateStatus(${appointment.id}, 'CANCELLED')">Cancel</button>
                <button class="action-btn delete" onclick="deleteAppointment(${appointment.id})">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });
}

function escapeHtml(value) {
    return String(value ?? "-")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function loadAppointments(showMessage = false) {
    try {
        const response = await fetch(API_URL + "?t=" + Date.now());
        if (!response.ok) throw new Error("Failed to load appointments");

        const appointments = await response.json();
        updateCards(appointments);
        renderAppointments(appointments);

        document.getElementById("lastUpdated").textContent =
            "Updated " + new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        if (showMessage) console.log("Dashboard refreshed");
    } catch (error) {
        console.error("Dashboard error:", error);
        document.getElementById("appointmentTable").innerHTML =
            `<tr><td colspan="10" class="loading">Unable to connect to Spring Boot. Make sure the backend is running on port 8080.</td></tr>`;
    }
}

async function updateStatus(id, status) {
    const message = status === "COMPLETED"
        ? "Mark this appointment as completed?"
        : "Cancel this appointment?";

    if (!confirm(message)) return;

    try {
        const response = await fetch(`${API_URL}/${id}/status?status=${status}`, {
            method: "PUT"
        });
        if (!response.ok) throw new Error("Status update failed");
        await loadAppointments();
    } catch (error) {
        console.error(error);
        alert("Unable to update appointment status.");
    }
}

async function deleteAppointment(id) {
    if (!confirm("Delete this appointment permanently?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Delete failed");
        await loadAppointments();
    } catch (error) {
        console.error(error);
        alert("Unable to delete appointment.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAppointments();
    setInterval(loadAppointments, 5000);
});
