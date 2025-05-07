package com.example.demo.controller;

import com.example.demo.model.Feedback;
import com.example.demo.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin/feedback")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminFeedbackController {
    @Autowired private FeedbackService svc;

    @GetMapping
    public ResponseEntity<List<Feedback>> listAll() {
        return ResponseEntity.ok(svc.getAllFeedback());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Boolean>> delete(@PathVariable String id) {
        svc.deleteFeedbackById(id);
        return ResponseEntity.ok(Map.of("deleted", true));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String,Object>> stats() {
        return ResponseEntity.ok(Map.of(
                "averageRating", svc.getAverageRating(),
                "count", svc.getFeedbackCount()
        ));
    }
}
