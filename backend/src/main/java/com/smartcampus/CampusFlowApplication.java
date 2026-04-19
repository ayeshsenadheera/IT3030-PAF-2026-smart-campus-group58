package com.smartcampus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class CampusFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(CampusFlowApplication.class, args);
    }
}
