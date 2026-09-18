package com.whichbin.whichbin_api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ApiController {

    @GetMapping("/")
    public Map<String, String> index() {
        return Map.of("version", "1.0");
    }
}