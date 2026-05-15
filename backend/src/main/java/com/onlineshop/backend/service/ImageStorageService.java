package com.onlineshop.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String saveImage(String folder, String originalFilename, byte[] data) throws IOException {
        Path root = Paths.get(uploadDir);
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        Path folderPath = root.resolve(folder);
        if (!Files.exists(folderPath)) {
            Files.createDirectories(folderPath);
        }

        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String filename = UUID.randomUUID().toString() + extension;
        Path filePath = folderPath.resolve(filename);
        Files.write(filePath, data);

        // Return relative path for database storage
        return folder + "/" + filename;
    }

    public byte[] loadImage(String relativePath) throws IOException {
        if (relativePath == null) return null;
        Path filePath = Paths.get(uploadDir).resolve(relativePath);
        if (Files.exists(filePath)) {
            return Files.readAllBytes(filePath);
        }
        return null;
    }

    public void deleteImage(String relativePath) {
        if (relativePath == null) return;
        try {
            Path filePath = Paths.get(uploadDir).resolve(relativePath);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log error but don't fail
            System.err.println("Failed to delete image: " + relativePath);
        }
    }
}
