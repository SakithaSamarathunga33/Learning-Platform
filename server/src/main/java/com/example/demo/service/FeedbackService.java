package com.example.demo.service;

import com.example.demo.model.Feedback;
import com.example.demo.repository.FeedbackRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FeedbackService {
    @Autowired private FeedbackRepository repo;

    public Feedback saveFeedback(Feedback fb) {
        return repo.save(fb);
    }

    public List<Feedback> getAllFeedback() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public void deleteFeedbackById(String id) {
        repo.deleteById(id);
    }

    public double getAverageRating() {
        List<Feedback> all = repo.findAll();
        return all.stream().mapToInt(Feedback::getRating).average().orElse(0.0);
    }

    public long getFeedbackCount() {
        return repo.count();
    }
}
