package com.event.ticketbooking.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String qrPath = new File("generated_qr").getAbsolutePath();
        String wallpaperPath = new File("generated_wallpapers").getAbsolutePath();

        registry.addResourceHandler("/qr/**")
                .addResourceLocations("file:" + qrPath + "/");

        registry.addResourceHandler("/wallpapers/**")
                .addResourceLocations("file:" + wallpaperPath + "/");
    }
}
