package com.jksaloon.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jksaloon.backend.entity.Appointment;
import com.jksaloon.backend.repository.AppointmentRepository;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    // Book Appointment
    public Appointment bookAppointment(Appointment appointment) {

        if (appointment.getStatus() == null ||
            appointment.getStatus().isBlank()) {

            appointment.setStatus("BOOKED");
        }

        return appointmentRepository.save(appointment);
    }

    // Get All Appointments
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // Get Appointment By ID
    public Appointment getAppointmentById(Long id) {

        return appointmentRepository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException(
                        "Appointment not found with id: " + id
                    )
                );
    }

    // Update Appointment Status
    public Appointment updateStatus(Long id, String status) {

        Appointment appointment = getAppointmentById(id);

        appointment.setStatus(status);

        return appointmentRepository.save(appointment);
    }

    // Delete Appointment
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}