package com.jksaloon.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jksaloon.backend.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

}