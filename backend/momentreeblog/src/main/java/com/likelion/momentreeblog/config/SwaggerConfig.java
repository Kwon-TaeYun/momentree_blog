package com.likelion.momentreeblog.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Momentree Blog",
                version = "1.0",
                description = "모멘트리 블로그 관리를 위한 API 문서"
        )

)
public class SwaggerConfig {
}
