package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User updateUser(String id, User userDetails) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            User existingUser = user.get();
            
            // For Google users, allow updating name and picture
            if ("google".equals(existingUser.getProvider())) {
                if (userDetails.getName() != null) {
                    existingUser.setName(userDetails.getName());
                }
                if (userDetails.getPicture() != null) {
                    existingUser.setPicture(userDetails.getPicture());
                }
            } else {
                // For regular users, allow updating all fields except email
                if (userDetails.getUsername() != null) {
                    existingUser.setUsername(userDetails.getUsername());
                }
                
                // Only update password if it's provided and not empty
                if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                    existingUser.setPassword(userDetails.getPassword());
                }
                
                // Update name if provided
                if (userDetails.getName() != null) {
                    existingUser.setName(userDetails.getName());
                }
                
                // Update picture if provided
                if (userDetails.getPicture() != null) {
                    existingUser.setPicture(userDetails.getPicture());
                }
            }
            
            return userRepository.save(existingUser);
        }
        return null;
    }

    @Override
    public boolean deleteUser(String id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
} 