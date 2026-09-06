package com.jksaloon.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jksaloon.backend.entity.SalonPackage;
import com.jksaloon.backend.service.SalonPackageService;

@RestController
@RequestMapping("/api/packages")
public class SalonPackageController {

    private final SalonPackageService salonPackageService;

    public SalonPackageController(SalonPackageService salonPackageService) {
        this.salonPackageService = salonPackageService;
    }

    @PostMapping
    public SalonPackage addPackage(@RequestBody SalonPackage salonPackage) {
        return salonPackageService.addPackage(salonPackage);
    }

    @GetMapping
    public List<SalonPackage> getAllPackages() {
        return salonPackageService.getAllPackages();
    }

    @GetMapping("/{id}")
    public SalonPackage getPackageById(@PathVariable Long id) {
        return salonPackageService.getPackageById(id);
    }

    @DeleteMapping("/{id}")
    public void deletePackage(@PathVariable Long id) {
        salonPackageService.deletePackage(id);
    }
}