// ========================================
// JK SALOON - RESPONSE.JS
// ========================================

const API_URL = "https://jk-saloon-backend-n69q.onrender.com/api/appointments";


// ========================================
// SALOON / OFFICE TIMINGS
// ========================================

// 10:00 AM
const OPEN_TIME = "10:00";

// 8:00 PM
const CLOSE_TIME = "20:00";


// ========================================
// GET TODAY DATE - INDIA
// ========================================

function getTodayIST() {

    const now = new Date();

    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(now);

}


// ========================================
// GET CURRENT TIME - INDIA
// ========================================

function getCurrentTimeIST() {

    const now = new Date();

    return new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    }).format(now);

}


// ========================================
// DATE & TIME DROPDOWNS
// ========================================

function setupDateTimeValidation() {

    const dateSelect = document.getElementById("appointmentDate");
    const timeSelect = document.getElementById("appointmentTime");

    if (!dateSelect || !timeSelect) return;

    const today = getTodayIST();

    // Create date dropdown for the next 30 days.
    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const value = `${year}-${month}-${day}`;

        const label = date.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        });

        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        dateSelect.appendChild(option);
    }

    function populateTimeDropdown(selectedDate) {
        timeSelect.innerHTML = '<option value="">Select Time</option>';

        if (!selectedDate) return;

        const currentTime = getCurrentTimeIST();

        for (let hour = 10; hour <= 20; hour++) {
            for (const minute of [0, 30]) {

                // 8:30 PM is outside salon hours.
                if (hour === 20 && minute === 30) continue;

                const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

                // For today, only show future slots.
                if (selectedDate === today && value <= currentTime) continue;

                const option = document.createElement("option");
                option.value = value;
                option.textContent = formatTime(value);
                timeSelect.appendChild(option);
            }
        }

        if (timeSelect.options.length === 1) {
            timeSelect.innerHTML = '<option value="">No slots available today</option>';
        }
    }

    // Set today's date automatically and load available times.
    dateSelect.value = today;
    populateTimeDropdown(today);

    dateSelect.addEventListener("change", function () {
        populateTimeDropdown(dateSelect.value);
    });
}


// ========================================
// FORMAT TIME
// ========================================

function formatTime(time) {
    const parts = time.split(":");
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
}


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "JK Saloon response.js loaded successfully"
        );

        console.log(
            "Backend API:",
            API_URL
        );

        console.log(
            "Office Time:",
            formatTime(OPEN_TIME),
            "-",
            formatTime(CLOSE_TIME)
        );


        const appointmentForm =
            document.getElementById(
                "appointmentForm"
            );


        if (appointmentForm) {

            appointmentForm.addEventListener(
                "submit",
                bookAppointment
            );

        }


        // Setup date and time
        setupDateTimeValidation();

    }
);


// ========================================
// BOOK APPOINTMENT
// ========================================

async function bookAppointment(event) {

    event.preventDefault();


    // ========================================
    // GET FORM VALUES
    // ========================================

    const name =
        document
            .getElementById("customerName")
            .value
            .trim();


    const phone =
        document
            .getElementById("customerPhone")
            .value
            .trim();


    const service =
        document
            .getElementById("service")
            .value;


    const packageName =
        document
            .getElementById("package")
            .value;


    const date =
        document
            .getElementById("appointmentDate")
            .value;


    const time =
        document
            .getElementById("appointmentTime")
            .value;


    // ========================================
    // REQUIRED VALIDATION
    // ========================================

    if (
        !name ||
        !phone ||
        !service ||
        !packageName ||
        !date ||
        !time
    ) {

        alert(
            "Please fill all appointment details."
        );

        return;

    }


    // ========================================
    // DATE/TIME VALIDATION
    // ========================================

    const today =
        getTodayIST();


    const currentTime =
        getCurrentTimeIST();


    // ----------------------------------------
    // PAST DATE
    // ----------------------------------------

    if (date < today) {

        alert(
            "Past dates are not allowed."
        );

        return;

    }


    // ----------------------------------------
    // OFFICE HOURS
    // ----------------------------------------

    if (
        time < OPEN_TIME ||
        time > CLOSE_TIME
    ) {

        alert(
            "Appointment time must be between " +
            formatTime(OPEN_TIME) +
            " and " +
            formatTime(CLOSE_TIME) +
            "."
        );

        return;

    }


    // ----------------------------------------
    // TODAY + PAST TIME
    // ----------------------------------------

    if (
        date === today &&
        time <= currentTime
    ) {

        alert(
            "Please select a future appointment time."
        );

        return;

    }


    // ========================================
    // CREATE APPOINTMENT OBJECT
    // ========================================

    const appointment = {

        customerName: name,

        phone: phone,

        styleName: service,

        packageName: packageName,

        appointmentDate: date,

        appointmentTime: time,

        status: "BOOKED"

    };


    console.log(
        "Sending appointment:",
        appointment
    );


    // ========================================
    // SEND TO SPRING BOOT
    // ========================================

    try {


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            appointment
                        )
                }
            );


        console.log(
            "Server response:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "Server Error: " +
                response.status
            );

        }
            showBookingSuccess({
    customer: name,
    service: service,
    packageName: packageName,
    date: date,
    time: time
});

        


        // ====================================
        // SAVED APPOINTMENT
        // ====================================

        const savedAppointment =
            await response.json();


        console.log(
            "Appointment saved successfully:",
            savedAppointment
        );


        // ====================================
        // SUCCESS MESSAGE
        // ====================================

        showBookingResponse(
            name,
            date,
            time
        );


        // ====================================
        // RESET FORM
        // ====================================

        document
            .getElementById(
                "appointmentForm"
            )
            .reset();


        // Form is reset to the default dropdown selections.


    }
    catch (error) {


        console.error(
            "Booking Error:",
            error
        );


        alert(
            "Unable to book appointment.\n\n" +
            "Please make sure Spring Boot is running on port 8080."
        );

    }

}


// ========================================
// SUCCESS MESSAGE
// ========================================

function showBookingResponse(
    name,
    date,
    time
) {


    const response =
        document.getElementById(
            "bookingResponse"
        );


    if (!response) {

        console.error(
            "bookingResponse element not found"
        );

        return;

    }


    response.innerHTML =

        '<div class="success-message">' +

            '<div class="success-icon">' +
                '✓' +
            '</div>' +

            '<h3>' +
                'Appointment Booked!' +
            '</h3>' +

            '<p>' +
                'Thank you <strong>' +
                name +
                '</strong>' +
            '</p>' +

            '<p>' +
                'Your appointment request has been received successfully.' +
            '</p>' +

            '<p>' +
                '📅 ' +
                date +
                '&nbsp;&nbsp; 🕐 ' +
                time +
            '</p>' +

            '<small>' +
                'Our team will contact you shortly.' +
            '</small>' +

        '</div>';


    response.style.display =
        "block";


    response.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    // Hide after 7 seconds

    setTimeout(
        function () {

            response.style.display =
                "none";

            response.innerHTML =
                "";

        },
        7000
    );

}


// ========================================
// SELECT STYLE
// ========================================

function selectStyle(styleName) {


    const service =
        document.getElementById(
            "service"
        );


    if (service) {


        const option =
            Array.from(
                service.options
            ).find(
                option =>
                    option.value
                        .trim() ===
                    styleName
                        .trim()
            );


        if (option) {

            service.value =
                option.value;


            console.log(
                "Style selected:",
                option.value
            );

        }
        else {

            console.warn(
                "Style not found:",
                styleName
            );

        }

    }


    const appointment =
        document.getElementById(
            "appointment"
        );


    if (appointment) {

        appointment.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


// ========================================
// SELECT PACKAGE
// ========================================

function selectPackage(packageName) {


    const packageSelect =
        document.getElementById(
            "package"
        );


    if (packageSelect) {


        const option =
            Array.from(
                packageSelect.options
            ).find(
                option =>
                    option.value
                        .trim() ===
                    packageName
                        .trim()
            );


        if (option) {

            packageSelect.value =
                option.value;


            console.log(
                "Package selected:",
                option.value
            );

        }
        else {

            console.warn(
                "Package not found:",
                packageName
            );

        }

    }


    const appointment =
        document.getElementById(
            "appointment"
        );


    if (appointment) {

        appointment.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


// ========================================
// HERO BOOK APPOINTMENT BUTTON
// ========================================

function goToAppointment() {


    const appointment =
        document.getElementById(
            "appointment"
        );


    if (appointment) {

        appointment.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


// ========================================
// TEST MESSAGE
// ========================================

console.log(
    "JK Saloon JavaScript is ready"
);

// ========================================
// MOBILE MENU
// ========================================

function toggleMobileMenu() {

    const nav = document.getElementById("mainNav");

    if (!nav) {
        return;
    }

    nav.classList.toggle("mobile-open");
}


// Close mobile menu after clicking a link

document.addEventListener("DOMContentLoaded", function () {

    const navLinks =
        document.querySelectorAll("#mainNav a");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            const nav =
                document.getElementById("mainNav");

            if (nav) {
                nav.classList.remove("mobile-open");
            }

        });

    });

});

/* =========================================
   BOOKING SUCCESS POPUP FUNCTIONS
   ========================================= */

function showBookingSuccess(details) {

    const modal = document.getElementById("bookingSuccessModal");

    if (!modal) return;

    document.getElementById("successCustomer").textContent =
        details.customer || "-";

    document.getElementById("successService").textContent =
        details.service || "-";

    document.getElementById("successPackage").textContent =
        details.packageName || "-";

    document.getElementById("successDate").textContent =
        details.date || "-";

    document.getElementById("successTime").textContent =
        details.time || "-";

    modal.classList.add("show");

    document.body.style.overflow = "hidden";

    setTimeout(function () {

        closeBookingSuccess();

    }, 5000);
}


function closeBookingSuccess() {

    const modal = document.getElementById("bookingSuccessModal");

    if (!modal) return;

    modal.classList.remove("show");

    document.body.style.overflow = "";
}