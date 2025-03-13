package com.example.demo.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.demo.model.Media;
import com.example.demo.model.User;
import com.example.demo.repository.MediaRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
public class MediaService {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private UserRepository userRepository;

    public Media uploadMedia(MultipartFile file, String userId, String title, String description) throws IOException {
        // Get user
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate file type
        String contentType = file.getContentType();
        String type = contentType != null && contentType.startsWith("video/") ? "VIDEO" : "PHOTO";
        
        // Upload to Cloudinary with resource type auto to handle both images and videos
        Map<?, ?> uploadResult = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "resource_type", "auto",
                "folder", "user_uploads/" + userId
            )
        );

        // Create media record
        Media media = new Media();
        media.setUploadedBy(user);
        media.setPublicId((String) uploadResult.get("public_id"));
        media.setUrl((String) uploadResult.get("secure_url"));
        media.setType(type);
        media.setTitle(title);
        media.setDescription(description);

        return mediaRepository.save(media);
    }

    public List<Media> getUserMedia(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return mediaRepository.findByUploadedBy(user);
    }

    public List<Media> getAllMedia() {
        return mediaRepository.findAll();
    }

    public List<Media> getMediaByType(String type) {
        return mediaRepository.findByType(type);
    }

    public void deleteMedia(String mediaId) throws IOException {
        Media media = mediaRepository.findById(mediaId)
            .orElseThrow(() -> new RuntimeException("Media not found"));

        // Delete from Cloudinary
        cloudinary.uploader().destroy(
            media.getPublicId(),
            ObjectUtils.asMap("resource_type", media.getType().equals("VIDEO") ? "video" : "image")
        );

        // Delete from database
        mediaRepository.deleteById(mediaId);
    }
}
