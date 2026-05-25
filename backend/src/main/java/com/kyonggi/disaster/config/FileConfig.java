package com.kyonggi.disaster.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/** 업로드 이미지 정적 리소스 제공 (/images/** → 로컬 uploads/images/) */
@Configuration
public class FileConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            Path dirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dirPath);

            String location = dirPath.toUri().toString();
            registry.addResourceHandler("/images/**")
                    .addResourceLocations(location);
        } catch (Exception e) {
            throw new IllegalStateException("업로드 이미지 경로 설정 실패: " + uploadDir, e);
        }
    }
}
