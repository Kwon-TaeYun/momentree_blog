package com.likelion.momentreeblog;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class MomentreeblogApplication {

	public static void main(String[] args) {
		SpringApplication.run(MomentreeblogApplication.class, args);
	}

}
