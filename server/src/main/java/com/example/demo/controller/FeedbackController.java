package com.example.demo.controller;

import com.example.demo.model.Feedback;
import com.example.demo.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins="*")
public class FeedbackController {
    @Autowired private FeedbackService svc;

    @PostMapping
    public ResponseEntity<Feedback> postFeedback(@RequestBody Feedback fb) {
        Feedback saved = svc.saveFeedback(fb);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Feedback>> listFeedback() {
        return ResponseEntity.ok(svc.getAllFeedback());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String,Object>> stats() {
        double avg = svc.getAverageRating();
        long count = svc.getAllFeedback().size();
        return ResponseEntity.ok(Map.of("averageRating", avg, "count", count));
    }
}
