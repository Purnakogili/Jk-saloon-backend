package com.jksaloon.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jksaloon.backend.entity.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPhone(String phone);
}