package com.likelion.momentreeblog.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Momentree Blog",
                version = "1.0",
                description = "모멘트리 블로그 관리를 위한 API 문서"),
        security = @SecurityRequirement(name = "bearerAuth")
        )

@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT"
)
public class SwaggerConfig {
//        @Bean
//        public OpenAPI openAPI() {
//                Server prodServer = new Server();
//                prodServer.setUrl("https://momentree.site");
//                prodServer.setDescription("프로덕션 서버");
//
//                return new OpenAPI()
//                        .servers(List.of(prodServer));
//        }

}
