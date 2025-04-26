package com.example.demo.service;

import com.example.demo.model.User;
import java.util.List;
import java.util.Set;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(String id);
    User createUser(User user);
    User updateUser(String id, User userDetails);
    boolean deleteUser(String id);
    User findByUsername(String username);
    User findByEmail(String email);
    User followUser(String userId, String userToFollowId);
    User unfollowUser(String userId, String userToUnfollowId);
    Set<User> getUserFollowers(String userId);
    Set<User> getUserFollowing(String userId);
    boolean isFollowing(String userId, String targetUserId);
    List<User> searchUsersByUsername(String searchQuery);
    User findUserByUsername(String username);
    User findUserByEmail(String email);
}
