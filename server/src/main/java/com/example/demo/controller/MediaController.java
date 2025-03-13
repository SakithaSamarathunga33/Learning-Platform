package com.example.demo.controller;

import com.example.demo.model.Media;
import com.example.demo.model.User;
import com.example.demo.repository.MediaRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Media>> getAllMedia() {
        return new ResponseEntity<>(mediaRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadMedia(@RequestBody Media media, Authentication authentication) {
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();
        media.setUploadedBy(user);
        mediaRepository.save(media);
        return new ResponseEntity<>("Media uploaded successfully", HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Media> getMediaById(@PathVariable String id) {
        Optional<Media> media = mediaRepository.findById(id);
        if (media.isPresent()) {
            return new ResponseEntity<>(media.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Media> updateMedia(@PathVariable String id, @RequestBody Media mediaDetails, Authentication authentication) {
        Optional<Media> mediaOptional = mediaRepository.findById(id);
        if (!mediaOptional.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Media media = mediaOptional.get();
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        User user = userOptional.get();

        if (!media.getUploadedBy().equals(user)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        media.setTitle(mediaDetails.getTitle());
        media.setDescription(mediaDetails.getDescription());
        mediaRepository.save(media);
        return new ResponseEntity<>(media, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteMedia(@PathVariable String id, Authentication authentication) {
        Optional<Media> mediaOptional = mediaRepository.findById(id);
        if (!mediaOptional.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Media media = mediaOptional.get();
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        User user = userOptional.get();

        if (!media.getUploadedBy().equals(user)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        mediaRepository.delete(media);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
