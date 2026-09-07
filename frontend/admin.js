const API_URL = "https://jk-saloon-backend-n69q.onrender.com/api/appointments";


// =========================================
// PACKAGE PRICES
// =========================================

const PACKAGE_PRICES = {
    "basic": 199,
    "classic": 299,
    "premium": 399,
    "royal": 499
};


// =========================================
// ADMIN LOGOUT
// =========================================

function adminLogout() {

    sessionStorage.removeItem("adminLoggedIn");

    window.location.href = "admin-login.html";
}


// =========================================
// GET PACKAGE PRICE
// =========================================

function getPackagePrice(packageName) {

    if (!packageName) return 0;

    const key = packageName
        .trim()
        .toLowerCase()
        .replace(" package", "")
        .trim();

    return PACKAGE_PRICES[key] || 0;
}


// =========================================
// GET TODAY DATE - INDIA
// =========================================

function getTodayIndia() {

    return new Intl.DateTimeFormat("en-CA", {

        timeZone: "Asia/Kolkata",

        year: "numeric",

        month: "2-digit",

        day: "2-digit"

    }).format(new Date());
}


// =========================================
// FORMAT MONEY
// =========================================

function formatMoney(value) {

    return "₹" + Number(value || 0).toLocaleString("en-IN");
}


// =========================================
// STATUS CSS
// =========================================

function statusClass(status) {

    const value = (status || "BOOKED").toLowerCase();

    if (value === "completed") {
        return "completed";
    }

    if (value === "cancelled") {
        return "cancelled";
    }

    return "booked";
}


// =========================================
// UPDATE DASHBOARD CARDS
// =========================================

function updateCards(appointments) {

    // -----------------------------------------
    // COUNTS
    // -----------------------------------------

    const total = appointments.length;

    const booked = appointments.filter(
        a => a.status === "BOOKED"
    ).length;

    const completed = appointments.filter(
        a => a.status === "COMPLETED"
    ).length;

    const cancelled = appointments.filter(
        a => a.status === "CANCELLED"
    ).length;


    // -----------------------------------------
    // COMPLETED APPOINTMENTS ONLY
    // -----------------------------------------

    const completedAppointments = appointments.filter(
        a => a.status === "COMPLETED"
    );


    // -----------------------------------------
    // TOTAL EARNINGS
    //
    // ONLY COMPLETED APPOINTMENTS
    // -----------------------------------------

    const totalEarnings = completedAppointments.reduce(

        (sum, appointment) => {

            return sum + getPackagePrice(
                appointment.packageName
            );

        },

        0
    );


    // -----------------------------------------
    // TODAY'S EARNINGS
    //
    // TODAY + COMPLETED ONLY
    // -----------------------------------------

    const today = getTodayIndia();

    const todayEarnings = completedAppointments

        .filter(
            appointment =>
                appointment.appointmentDate === today
        )

        .reduce(

            (sum, appointment) => {

                return sum + getPackagePrice(
                    appointment.packageName
                );

            },

            0
        );


    // -----------------------------------------
    // UPDATE UI
    // -----------------------------------------

    document.getElementById("totalCount").textContent =
        total;

    document.getElementById("bookedCount").textContent =
        booked;

    document.getElementById("completedCount").textContent =
        completed;

    document.getElementById("cancelledCount").textContent =
        cancelled;

    document.getElementById("totalEarnings").textContent =
        formatMoney(totalEarnings);

    document.getElementById("todayEarnings").textContent =
        formatMoney(todayEarnings);
}


// =========================================
// RENDER APPOINTMENTS
// =========================================

function renderAppointments(appointments) {

    const table =
        document.getElementById("appointmentTable");

    table.innerHTML = "";


    if (!appointments.length) {

        table.innerHTML = `
            <tr>
                <td colspan="10" class="empty">
                    No appointments found.
                </td>
            </tr>
        `;

        return;
    }


    appointments.forEach(appointment => {

        const row = document.createElement("tr");

        const price =
            getPackagePrice(appointment.packageName);

        const status =
            appointment.status || "BOOKED";

        const statusCss =
            statusClass(status);


        row.innerHTML = `

            <td>
                #${appointment.id ?? "-"}
            </td>

            <td>
                <strong>
                    ${escapeHtml(appointment.customerName)}
                </strong>
            </td>

            <td>
                ${escapeHtml(appointment.phone)}
            </td>

            <td>
                ${escapeHtml(appointment.styleName)}
            </td>

            <td>
                ${escapeHtml(appointment.packageName)}
            </td>

            <td>
                ${escapeHtml(appointment.appointmentDate)}
            </td>

            <td>
                ${escapeHtml(appointment.appointmentTime)}
            </td>

            <td class="price">
                ${formatMoney(price)}
            </td>

            <td>
                <span class="status ${statusCss}">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td class="action-cell">

                <button
                    class="action-btn complete"
                    onclick="updateStatus(
                        ${appointment.id},
                        'COMPLETED'
                    )">

                    Complete

                </button>

                <button
                    class="action-btn cancel"
                    onclick="updateStatus(
                        ${appointment.id},
                        'CANCELLED'
                    )">

                    Cancel

                </button>

                <button
                    class="action-btn delete"
                    onclick="deleteAppointment(
                        ${appointment.id}
                    )">

                    Delete

                </button>

            </td>
        `;


        table.appendChild(row);

    });
}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHtml(value) {

    return String(value ?? "-")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");
}


// =========================================
// LOAD APPOINTMENTS
// =========================================

async function loadAppointments(showMessage = false) {

    try {

        const response = await fetch(
            API_URL + "?t=" + Date.now()
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load appointments"
            );

        }


        const appointments =
            await response.json();


        // Update dashboard
        updateCards(appointments);


        // Update table
        renderAppointments(appointments);


        // Last updated time
        document.getElementById("lastUpdated").textContent =

            "Updated " +

            new Date().toLocaleTimeString(
                "en-IN",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


        if (showMessage) {

            console.log(
                "Dashboard refreshed"
            );

        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        document.getElementById(
            "appointmentTable"
        ).innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="loading">

                    Unable to connect to Spring Boot.
                    Make sure the backend is running.

                </td>

            </tr>

        `;

    }
}


// =========================================
// UPDATE STATUS
// =========================================

async function updateStatus(id, status) {

    const message =

        status === "COMPLETED"

            ? "Mark this appointment as completed?"

            : "Cancel this appointment?";


    if (!confirm(message)) {

        return;

    }


    try {

        const response = await fetch(

            `${API_URL}/${id}/status?status=${status}`,

            {
                method: "PUT"
            }

        );


        if (!response.ok) {

            throw new Error(
                "Status update failed"
            );

        }


        // Reload dashboard
        await loadAppointments();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to update appointment status."
        );

    }
}


// =========================================
// DELETE APPOINTMENT
// =========================================

async function deleteAppointment(id) {

    if (
        !confirm(
            "Delete this appointment permanently?"
        )
    ) {

        return;

    }


    try {

        const response = await fetch(

            `${API_URL}/${id}`,

            {
                method: "DELETE"
            }

        );


        if (!response.ok) {

            throw new Error(
                "Delete failed"
            );

        }


        // Reload dashboard
        await loadAppointments();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete appointment."
        );

    }
}


// =========================================
// AUTO LOAD
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAppointments();

        // Refresh every 5 seconds
        setInterval(
            loadAppointments,
            5000
        );

    }
);