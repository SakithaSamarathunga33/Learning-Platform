package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.HashSet;

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
            
            // Update name if provided
            if (userDetails.getName() != null) {
                existingUser.setName(userDetails.getName());
            }
            
            // Update picture if provided
            if (userDetails.getPicture() != null) {
                existingUser.setPicture(userDetails.getPicture());
            }
            
            // Update roles if provided
            if (userDetails.getRoles() != null) {
                existingUser.setRoles(userDetails.getRoles());
            }
            
            // For Google users, only allow updating name and picture
            if ("google".equals(existingUser.getProvider())) {
                return userRepository.save(existingUser);
            }
            
            // For regular users, allow updating all fields except email
            if (userDetails.getUsername() != null) {
                existingUser.setUsername(userDetails.getUsername());
            }
            
            // Only update password if it's provided and not empty
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                existingUser.setPassword(userDetails.getPassword());
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
    public User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    @Override
    public List<User> searchUsersByUsername(String searchQuery) {
        // Convert to lowercase for case-insensitive search
        String lowerCaseQuery = searchQuery.toLowerCase();
        
        // Get all users and filter by username containing the search query
        return userRepository.findAll().stream()
            .filter(user -> user.getUsername() != null && 
                           user.getUsername().toLowerCase().contains(lowerCaseQuery))
            .limit(10) // Limit results to 10 users
            .collect(Collectors.toList());
    }

    @Override
    public boolean isFollowing(String userId, String targetUserId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Set<String> following = user.getFollowing();
            return following != null && following.contains(targetUserId);
        }
        return false;
    }

    @Override
    public Set<User> getUserFollowing(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Set<String> followingIds = user.getFollowing();
            if (followingIds != null && !followingIds.isEmpty()) {
                return followingIds.stream()
                    .map(id -> userRepository.findById(id).orElse(null))
                    .filter(following -> following != null)
                    .collect(Collectors.toSet());
            }
        }
        return new HashSet<>();
    }

    @Override
    public Set<User> getUserFollowers(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            // Find all users who have this user in their following list
            return userRepository.findAll().stream()
                .filter(user -> user.getFollowing() != null && user.getFollowing().contains(userId))
                .collect(Collectors.toSet());
        }
        return new HashSet<>();
    }

    @Override
    public User followUser(String userId, String userToFollowId) {
        if (userId.equals(userToFollowId)) {
            return null; // Can't follow yourself
        }
        
        Optional<User> currentUserOpt = userRepository.findById(userId);
        Optional<User> userToFollowOpt = userRepository.findById(userToFollowId);
        
        if (currentUserOpt.isPresent() && userToFollowOpt.isPresent()) {
            User currentUser = currentUserOpt.get();
            User userToFollow = userToFollowOpt.get();
            
            // Add to current user's following list
            Set<String> following = currentUser.getFollowing();
            if (following == null) {
                following = new HashSet<>();
            }
            following.add(userToFollowId);
            currentUser.setFollowing(following);
            
            // Add to target user's followers list
            Set<String> followers = userToFollow.getFollowers();
            if (followers == null) {
                followers = new HashSet<>();
            }
            followers.add(userId);
            userToFollow.setFollowers(followers);
            
            // Save both users
            userRepository.save(userToFollow);
            return userRepository.save(currentUser);
        }
        
        return null;
    }
    
    @Override
    public User unfollowUser(String userId, String userToUnfollowId) {
        Optional<User> currentUserOpt = userRepository.findById(userId);
        Optional<User> userToUnfollowOpt = userRepository.findById(userToUnfollowId);
        
        if (currentUserOpt.isPresent() && userToUnfollowOpt.isPresent()) {
            User currentUser = currentUserOpt.get();
            User userToUnfollow = userToUnfollowOpt.get();
            
            // Remove from current user's following list
            Set<String> following = currentUser.getFollowing();
            if (following != null) {
                following.remove(userToUnfollowId);
                currentUser.setFollowing(following);
            }
            
            // Remove from target user's followers list
            Set<String> followers = userToUnfollow.getFollowers();
            if (followers != null) {
                followers.remove(userId);
                userToUnfollow.setFollowers(followers);
            }
            
            // Save both users
            userRepository.save(userToUnfollow);
            return userRepository.save(currentUser);
        }
        
        return null;
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