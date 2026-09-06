package com.jksaloon.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jksaloon.backend.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

}