// ========================================
// JK SALOON - RESPONSE.JS
// ========================================

const API_URL =
    "https://jk-saloon-backend-n69q.onrender.com/api/appointments";


// ========================================
// SALOON TIMINGS
// ========================================

const OPEN_TIME = "09:00";
const CLOSE_TIME = "21:00";

const LUNCH_START = "13:00";
const LUNCH_END = "14:30";


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
// FORMAT TIME
// ========================================

function formatTime(time) {

    const parts = time.split(":");

    let hour = parseInt(parts[0], 10);

    const minute = parts[1];

    const ampm = hour >= 12 ? "PM" : "AM";

    hour = hour % 12;

    if (hour === 0) {
        hour = 12;
    }

    return `${hour}:${minute} ${ampm}`;
}


// ========================================
// CHECK LUNCH BREAK
// ========================================

function isLunchBreak(time) {

    return time >= LUNCH_START &&
           time < LUNCH_END;
}


// ========================================
// DATE & TIME DROPDOWNS
// ========================================

function setupDateTimeValidation() {

    const dateSelect =
        document.getElementById("appointmentDate");

    const timeSelect =
        document.getElementById("appointmentTime");

    if (!dateSelect || !timeSelect) {
        return;
    }

    const today = getTodayIST();


    // ====================================
    // CREATE DATE OPTIONS
    // NEXT 30 DAYS
    // ====================================

    dateSelect.innerHTML =
        '<option value="">Select Date</option>';

    for (let i = 0; i < 30; i++) {

        const date = new Date();

        date.setDate(
            date.getDate() + i
        );

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        const value =
            `${year}-${month}-${day}`;

        const label =
            date.toLocaleDateString(
                "en-IN",
                {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = label;

        dateSelect.appendChild(option);
    }


    // ====================================
    // POPULATE TIME OPTIONS
    // ====================================

    function populateTimeDropdown(selectedDate) {

        timeSelect.innerHTML =
            '<option value="">Select Time</option>';

        if (!selectedDate) {
            return;
        }

        const currentTime =
            getCurrentTimeIST();


        // ====================================
        // 09:00 AM TO 09:00 PM
        // 30 MINUTE INTERVAL
        // ====================================

        for (let hour = 9; hour <= 21; hour++) {

            for (const minute of [0, 30]) {

                // Do not create 09:30 PM
                if (
                    hour === 21 &&
                    minute === 30
                ) {
                    continue;
                }

                const value =
                    `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;


                // ====================================
                // LUNCH BREAK
                // ====================================

                if (isLunchBreak(value)) {
                    continue;
                }


                // ====================================
                // TODAY - PAST TIMES NOT ALLOWED
                // ====================================

                if (
                    selectedDate === today &&
                    value <= currentTime
                ) {
                    continue;
                }


                const option =
                    document.createElement("option");

                option.value = value;

                option.textContent =
                    formatTime(value);

                timeSelect.appendChild(option);
            }
        }


        // ====================================
        // NO AVAILABLE SLOTS
        // ====================================

        if (timeSelect.options.length === 1) {

            timeSelect.innerHTML =
                '<option value="">No slots available</option>';
        }
    }


    // ====================================
    // SET TODAY
    // ====================================

    dateSelect.value = today;

    populateTimeDropdown(today);


    // ====================================
    // DATE CHANGE
    // ====================================

    dateSelect.addEventListener(
        "change",
        function () {

            populateTimeDropdown(
                dateSelect.value
            );
        }
    );
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
            "Salon Time:",
            formatTime(OPEN_TIME),
            "-",
            formatTime(CLOSE_TIME)
        );

        console.log(
            "Lunch Break:",
            formatTime(LUNCH_START),
            "-",
            formatTime(LUNCH_END)
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


        setupDateTimeValidation();


        // ====================================
        // PHONE INPUT - ONLY NUMBERS
        // ====================================

        const phoneInput =
            document.getElementById(
                "customerPhone"
            );


        if (phoneInput) {

            phoneInput.addEventListener(
                "input",
                function () {

                    this.value =
                        this.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                }
            );
        }
    }
);


// ========================================
// GET ALL APPOINTMENTS
// ========================================

async function getAllAppointments() {

    const response =
        await fetch(
            API_URL + "?t=" + Date.now()
        );


    if (!response.ok) {

        throw new Error(
            "Unable to fetch appointments"
        );
    }


    return await response.json();
}


// ========================================
// CHECK SAME PHONE - 24 HOURS
// ========================================

function hasRecentAppointment(
    appointments,
    phone
) {

    const now = new Date();


    return appointments.some(
        function (appointment) {

            if (!appointment.phone) {
                return false;
            }


            // ====================================
            // EXACT PHONE NUMBER
            // ====================================

            if (
                appointment.phone.trim() !==
                phone.trim()
            ) {
                return false;
            }


            if (
                !appointment.appointmentDate ||
                !appointment.appointmentTime
            ) {
                return false;
            }


            // ====================================
            // CANCELLED APPOINTMENTS
            // SHOULD NOT BLOCK
            // ====================================

            if (
                appointment.status &&
                appointment.status
                    .toUpperCase() === "CANCELLED"
            ) {
                return false;
            }


            const appointmentDateTime =
                new Date(
                    `${appointment.appointmentDate}T${appointment.appointmentTime}`
                );


            const difference =
                now.getTime() -
                appointmentDateTime.getTime();


            // ====================================
            // FUTURE APPOINTMENT
            // ====================================

            if (difference < 0) {
                return true;
            }


            // ====================================
            // PREVIOUS 24 HOURS
            // ====================================

            return difference <
                24 * 60 * 60 * 1000;
        }
    );
}


// ========================================
// CHECK SAME DATE + TIME
// ========================================

function isSlotAlreadyBooked(
    appointments,
    date,
    time
) {

    return appointments.some(
        function (appointment) {

            return (
                appointment.appointmentDate === date &&
                appointment.appointmentTime === time &&
                (!appointment.status ||
                 appointment.status.toUpperCase() !== "CANCELLED")
            );
        }
    );
}


// ========================================
// BOOK APPOINTMENT
// ========================================

async function bookAppointment(event) {

    event.preventDefault();


    // ====================================
    // GET FORM VALUES
    // ====================================

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


    // ====================================
    // REQUIRED VALIDATION
    // ====================================

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


    // ====================================
    // PHONE VALIDATION
    // ====================================

    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Please enter a valid 10-digit mobile number."
        );

        return;
    }


    // ====================================
    // DATE / TIME VALIDATION
    // ====================================

    const today =
        getTodayIST();

    const currentTime =
        getCurrentTimeIST();


    // ====================================
    // PAST DATE
    // ====================================

    if (date < today) {

        alert(
            "Past dates are not allowed."
        );

        return;
    }


    // ====================================
    // SALON HOURS
    // ====================================

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


    // ====================================
    // LUNCH BREAK
    // ====================================

    if (isLunchBreak(time)) {

        alert(
            "Lunch break is from " +
            formatTime(LUNCH_START) +
            " to " +
            formatTime(LUNCH_END) +
            ". Please select another time."
        );

        return;
    }


    // ====================================
    // TODAY + PAST TIME
    // ====================================

    if (
        date === today &&
        time <= currentTime
    ) {

        alert(
            "Please select a future appointment time."
        );

        return;
    }


    // ====================================
    // GET EXISTING APPOINTMENTS
    // ====================================

    let appointments;


    try {

        appointments =
            await getAllAppointments();

    } catch (error) {

        console.error(
            "Appointment Fetch Error:",
            error
        );

        alert(
            "Unable to check appointment availability. Please try again."
        );

        return;
    }


    // ====================================
    // SAME DATE + SAME TIME
    // ====================================

    if (
        isSlotAlreadyBooked(
            appointments,
            date,
            time
        )
    ) {

        alert(
            "This appointment time is already booked. Please select another time."
        );

        return;
    }


    // ====================================
    // SAME PERSON - 24 HOURS
    // ====================================

    if (
        hasRecentAppointment(
            appointments,
            phone
        )
    ) {

        alert(
            "This mobile number already has an appointment within 24 hours. Please try again after 24 hours."
        );

        return;
    }


    // ====================================
    // CREATE APPOINTMENT OBJECT
    // ====================================

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
            "Server response status:",
            response.status
        );


        // ====================================
        // SERVER ERROR
        // ====================================

        if (!response.ok) {

            let errorMessage =
                "Unable to book appointment.";


            try {

                // Read response as TEXT
                const responseText =
                    await response.text();


                console.log(
                    "Server error response:",
                    responseText
                );


                if (responseText.trim()) {

                    // ====================================
                    // TRY JSON
                    // ====================================

                    try {

                        const errorData =
                            JSON.parse(
                                responseText
                            );


                        if (
                            errorData.message
                        ) {

                            errorMessage =
                                errorData.message;

                        } else if (
                            errorData.error
                        ) {

                            errorMessage =
                                errorData.error;
                        }

                    } catch (jsonError) {

                        // ====================================
                        // PLAIN TEXT RESPONSE
                        // ====================================

                        errorMessage =
                            responseText.trim();
                    }
                }

            } catch (readError) {

                console.error(
                    "Unable to read server error:",
                    readError
                );
            }


            console.error(
                "Booking failed:",
                response.status,
                errorMessage
            );


            alert(
                errorMessage
            );

            return;
        }


        // ====================================
        // SUCCESS RESPONSE
        // ====================================

        const savedAppointment =
            await response.json();


        console.log(
            "Appointment saved successfully:",
            savedAppointment
        );


        // ====================================
        // SUCCESS POPUP
        // ====================================

        showBookingSuccess({

            customer: name,

            service: service,

            packageName: packageName,

            date: date,

            time: formatTime(time)
        });


        // ====================================
        // OLD SUCCESS RESPONSE
        // ====================================

        showBookingResponse(
            name,
            date,
            formatTime(time)
        );


        // ====================================
        // RESET FORM
        // ====================================

        const appointmentForm =
            document.getElementById(
                "appointmentForm"
            );


        if (appointmentForm) {

            appointmentForm.reset();
        }


        // ====================================
        // RESTORE TODAY
        // ====================================

        const dateSelect =
            document.getElementById(
                "appointmentDate"
            );


        if (dateSelect) {

            dateSelect.value =
                getTodayIST();


            const changeEvent =
                new Event("change");


            dateSelect.dispatchEvent(
                changeEvent
            );
        }

    } catch (error) {

        console.error(
            "Booking Error:",
            error
        );


        alert(
            "Unable to book appointment.\n\n" +
            "Please try again."
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

        } else {

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

        } else {

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
// MOBILE MENU
// ========================================

function toggleMobileMenu() {

    const nav =
        document.getElementById(
            "mainNav"
        );


    if (!nav) {
        return;
    }


    nav.classList.toggle(
        "mobile-open"
    );
}


// ========================================
// CLOSE MOBILE MENU
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const navLinks =
            document.querySelectorAll(
                "#mainNav a"
            );


        navLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        const nav =
                            document.getElementById(
                                "mainNav"
                            );


                        if (nav) {

                            nav.classList.remove(
                                "mobile-open"
                            );
                        }
                    }
                );
            }
        );
    }
);


// =========================================
// BOOKING SUCCESS POPUP
// =========================================

function showBookingSuccess(details) {

    const modal =
        document.getElementById(
            "bookingSuccessModal"
        );


    if (!modal) {
        return;
    }


    const successCustomer =
        document.getElementById(
            "successCustomer"
        );

    const successService =
        document.getElementById(
            "successService"
        );

    const successPackage =
        document.getElementById(
            "successPackage"
        );

    const successDate =
        document.getElementById(
            "successDate"
        );

    const successTime =
        document.getElementById(
            "successTime"
        );


    if (successCustomer) {

        successCustomer.textContent =
            details.customer || "-";
    }


    if (successService) {

        successService.textContent =
            details.service || "-";
    }


    if (successPackage) {

        successPackage.textContent =
            details.packageName || "-";
    }


    if (successDate) {

        successDate.textContent =
            details.date || "-";
    }


    if (successTime) {

        successTime.textContent =
            details.time || "-";
    }


    modal.classList.add("show");

    document.body.style.overflow =
        "hidden";


    setTimeout(
        function () {

            closeBookingSuccess();

        },
        5000
    );
}


// =========================================
// CLOSE BOOKING SUCCESS
// =========================================

function closeBookingSuccess() {

    const modal =
        document.getElementById(
            "bookingSuccessModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("show");

    document.body.style.overflow =
        "";
}


// ========================================
// TEST
// ========================================

console.log(
    "JK Saloon JavaScript is ready"
);