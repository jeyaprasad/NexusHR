package com.zidio.insiihr;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class InsiihrApplication {

    public static void main(String[] args) {
        SpringApplication.run(InsiihrApplication.class, args);
    }

}
