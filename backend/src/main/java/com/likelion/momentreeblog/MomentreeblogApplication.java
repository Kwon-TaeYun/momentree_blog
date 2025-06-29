package com.likelion.momentreeblog;
import org.springframework.boot.SpringApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@EnableJpaAuditing
@SpringBootApplication
public class MomentreeblogApplication {
    public static void main(String[] args) {
        SpringApplication.run(MomentreeblogApplication.class, args);
    }
}
