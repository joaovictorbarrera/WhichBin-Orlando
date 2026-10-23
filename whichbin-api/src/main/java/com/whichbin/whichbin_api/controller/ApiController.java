package com.whichbin.whichbin_api.controller;

import org.springframework.boot.info.BuildProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ApiController {

    private final BuildProperties buildProperties;

    public ApiController(BuildProperties buildProperties) {
        this.buildProperties = buildProperties;
    }

    @GetMapping("/")
    public Map<String, String> index() {
        return Map.of(
                "version", buildProperties.getVersion()
        );
    }
}
