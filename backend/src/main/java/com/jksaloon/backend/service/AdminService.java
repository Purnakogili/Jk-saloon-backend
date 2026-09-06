package com.jksaloon.backend.service;

import org.springframework.stereotype.Service;

import com.jksaloon.backend.entity.Admin;
import com.jksaloon.backend.repository.AdminRepository;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public boolean login(String username, String password) {

        return adminRepository.findByUsername(username)
                .map(admin -> admin.getPassword().equals(password))
                .orElse(false);
    }
}