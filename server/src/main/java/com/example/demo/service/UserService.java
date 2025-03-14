package com.example.demo.service;

import com.example.demo.model.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(String id);
    User createUser(User user);
    User updateUser(String id, User userDetails);
    boolean deleteUser(String id);
    User findByUsername(String username);
    User findByEmail(String email);
}
