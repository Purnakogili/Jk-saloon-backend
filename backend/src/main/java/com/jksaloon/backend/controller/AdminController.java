package com.jksaloon.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jksaloon.backend.service.AdminService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {

        String username = loginData.get("username");
        String password = loginData.get("password");

        boolean success = adminService.login(username, password);

        if (success) {
            return ResponseEntity.ok(
                    Map.of(
                        "success", true,
                        "message", "Login successful"
                    )
            );
        }

        return ResponseEntity.status(401).body(
                Map.of(
                    "success", false,
                    "message", "Invalid username or password"
                )
        );
    }
}