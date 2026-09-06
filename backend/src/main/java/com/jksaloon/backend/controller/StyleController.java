package com.jksaloon.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jksaloon.backend.entity.Style;
import com.jksaloon.backend.service.StyleService;

@RestController
@RequestMapping("/api/styles")
public class StyleController {

    private final StyleService styleService;

    public StyleController(StyleService styleService) {
        this.styleService = styleService;
    }

    @PostMapping
    public Style addStyle(@RequestBody Style style) {
        return styleService.addStyle(style);
    }

    @GetMapping
    public List<Style> getAllStyles() {
        return styleService.getAllStyles();
    }

    @GetMapping("/{id}")
    public Style getStyleById(@PathVariable Long id) {
        return styleService.getStyleById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteStyle(@PathVariable Long id) {
        styleService.deleteStyle(id);
    }
}