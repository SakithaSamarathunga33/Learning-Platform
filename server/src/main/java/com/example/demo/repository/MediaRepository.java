package com.example.demo.repository;

import com.example.demo.model.Media;
import com.example.demo.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface MediaRepository extends MongoRepository<Media, String> {
    List<Media> findByUploadedBy(User uploadedBy);
    List<Media> findByType(String type);
}
