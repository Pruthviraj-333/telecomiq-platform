package com.telecomiq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TelecomIqApplication {

    public static void main(String[] args) {
        SpringApplication.run(TelecomIqApplication.class, args);
    }
}
