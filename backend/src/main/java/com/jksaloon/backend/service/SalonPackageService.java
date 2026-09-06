package com.jksaloon.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jksaloon.backend.entity.SalonPackage;
import com.jksaloon.backend.repository.SalonPackageRepository;

@Service
public class SalonPackageService {

    private final SalonPackageRepository salonPackageRepository;

    public SalonPackageService(SalonPackageRepository salonPackageRepository) {
        this.salonPackageRepository = salonPackageRepository;
    }

    public SalonPackage addPackage(SalonPackage salonPackage) {
        return salonPackageRepository.save(salonPackage);
    }

    public List<SalonPackage> getAllPackages() {
        return salonPackageRepository.findAll();
    }

    public SalonPackage getPackageById(Long id) {
        return salonPackageRepository.findById(id).orElse(null);
    }

    public void deletePackage(Long id) {
        salonPackageRepository.deleteById(id);
    }
}