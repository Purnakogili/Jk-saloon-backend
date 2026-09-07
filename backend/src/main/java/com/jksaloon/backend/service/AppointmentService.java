package com.jksaloon.backend.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.jksaloon.backend.entity.Appointment;
import com.jksaloon.backend.repository.AppointmentRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }


    public Appointment bookAppointment(Appointment appointment) {

        // =========================================
        // BASIC VALIDATION
        // =========================================

        if (appointment.getCustomerName() == null ||
                appointment.getCustomerName().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please enter your name."
            );
        }


        // =========================================
        // PHONE - EXACTLY 10 DIGITS
        // =========================================

        String phone = appointment.getPhone();

        if (phone == null || !phone.matches("\\d{10}")) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please enter a valid 10-digit mobile number."
            );
        }

        appointment.setPhone(phone);


        // =========================================
        // DATE VALIDATION
        // =========================================

        LocalDate date = appointment.getAppointmentDate();

        if (date == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select appointment date."
            );
        }


        // =========================================
        // TIME VALIDATION
        // =========================================

        LocalTime time = appointment.getAppointmentTime();

        if (time == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select appointment time."
            );
        }


        // =========================================
        // SALOON TIMING
        // 09:00 AM - 09:00 PM
        // =========================================

        LocalTime openingTime = LocalTime.of(9, 0);
        LocalTime closingTime = LocalTime.of(21, 0);

        if (time.isBefore(openingTime) || time.isAfter(closingTime)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointments are available only from 09:00 AM to 09:00 PM."
            );
        }


        // =========================================
        // LUNCH BREAK
        // 01:00 PM - 02:30 PM
        //
        // 01:00 ❌
        // 01:30 ❌
        // 02:00 ❌
        // 02:30 ✅
        // =========================================

        LocalTime lunchStart = LocalTime.of(13, 0);
        LocalTime lunchEnd = LocalTime.of(14, 30);

        if (!time.isBefore(lunchStart) && time.isBefore(lunchEnd)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Lunch break is from 01:00 PM to 02:30 PM. Please select another time."
            );
        }


        // =========================================
        // DEFAULT STATUS
        // =========================================

        if (appointment.getStatus() == null ||
                appointment.getStatus().isBlank()) {

            appointment.setStatus("BOOKED");
        }


        // =========================================
        // DUPLICATE DATE + TIME CHECK
        // =========================================

        boolean slotAlreadyBooked =
                appointmentRepository.existsByAppointmentDateAndAppointmentTime(
                        date,
                        time
                );

        if (slotAlreadyBooked) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This appointment time is already booked. Please select another time."
            );
        }


        // =========================================
        // SAME PHONE - 24 HOURS RESTRICTION
        // =========================================

        List<Appointment> previousAppointments =
                appointmentRepository.findByPhone(phone);


        LocalDateTime requestedDateTime =
                LocalDateTime.of(date, time);


        for (Appointment existing : previousAppointments) {

            if (existing.getAppointmentDate() == null ||
                    existing.getAppointmentTime() == null) {

                continue;
            }


            // Ignore cancelled appointments
            if (existing.getStatus() != null &&
                    existing.getStatus().equalsIgnoreCase("CANCELLED")) {

                continue;
            }


            LocalDateTime existingDateTime =
                    LocalDateTime.of(
                            existing.getAppointmentDate(),
                            existing.getAppointmentTime()
                    );


            Duration difference =
                    Duration.between(
                            existingDateTime,
                            requestedDateTime
                    ).abs();


            // Less than 24 hours = BLOCK
            if (difference.compareTo(Duration.ofHours(24)) < 0) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This mobile number already has an appointment within 24 hours. Please book after 24 hours."
                );
            }
        }


        // =========================================
        // SAVE APPOINTMENT
        // =========================================

        try {

            return appointmentRepository.saveAndFlush(appointment);

        } catch (DataIntegrityViolationException e) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This appointment time is already booked. Please select another time."
            );
        }
    }


    // =========================================
    // GET ALL APPOINTMENTS
    // =========================================

    public List<Appointment> getAllAppointments() {

        return appointmentRepository.findAll();
    }


    // =========================================
    // GET APPOINTMENT BY ID
    // =========================================

    public Appointment getAppointmentById(Long id) {

        return appointmentRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Appointment not found with id: " + id
                        )
                );
    }


    // =========================================
    // UPDATE STATUS
    // =========================================

    public Appointment updateStatus(Long id, String status) {

        Appointment appointment = getAppointmentById(id);

        appointment.setStatus(status);

        return appointmentRepository.save(appointment);
    }


    // =========================================
    // DELETE APPOINTMENT
    // =========================================

    public void deleteAppointment(Long id) {

        appointmentRepository.deleteById(id);
    }
}