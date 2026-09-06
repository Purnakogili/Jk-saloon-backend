package com.jksaloon.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.jksaloon.backend.entity.Style;
import com.jksaloon.backend.repository.StyleRepository;

@Service
public class StyleService {

    private final StyleRepository styleRepository;

    public StyleService(StyleRepository styleRepository) {
        this.styleRepository = styleRepository;
    }

    public Style addStyle(Style style) {
        return styleRepository.save(style);
    }

    public List<Style> getAllStyles() {
        return styleRepository.findAll();
    }

    public Style getStyleById(Long id) {
        return styleRepository.findById(id).orElse(null);
    }

    public void deleteStyle(Long id) {
        styleRepository.deleteById(id);
    }
}
