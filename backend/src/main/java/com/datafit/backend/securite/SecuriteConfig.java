package com.datafit.backend.securite;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// Branche le contrôle d'accès sur toute l'API.
@Configuration
public class SecuriteConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    public SecuriteConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor).addPathPatterns("/api/**");
    }
}
