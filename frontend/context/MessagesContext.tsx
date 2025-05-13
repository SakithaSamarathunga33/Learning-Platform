'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/utils/api'; // Import the configured axios instance

// Define Message interface
interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  read: boolean;
  sender: User;
  recipient: User;
}

interface MessagesContextType {
  unreadCount: number;
  lastMessage: Message | null;
  updateUnreadCount: () => Promise<void>;
  resetUnreadCount: () => void;
  isInitialized: boolean;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    console.log("MessagesContext: Initializing");
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("MessagesContext: User found in localStorage", parsedUser.username);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    } else {
      console.log("MessagesContext: No user found in localStorage");
    }

    // Listen for user changes (login/logout)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          const parsedUser = JSON.parse(updatedUser);
          console.log("MessagesContext: User updated", parsedUser.username);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing updated user:', error);
        }
      } else {
        console.log("MessagesContext: User logged out");
        setUser(null);
        setUnreadCount(0);
        setLastMessage(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChange', handleStorageChange);

    setIsInitialized(true);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChange', handleStorageChange);
    };
  }, []);

  // Add a listener for token invalidation
  useEffect(() => {
    const handleTokenInvalid = () => {
      console.log("MessagesContext: Token invalid event received");
      // Clear user data since token is invalid
      setUser(null);
      setUnreadCount(0);
      setLastMessage(null);
      
      // You might want to show a notification or redirect to login
    };
    
    window.addEventListener('tokenInvalid', handleTokenInvalid);
    
    return () => {
      window.removeEventListener('tokenInvalid', handleTokenInvalid);
    };
  }, []);

  // Define updateUnreadCount as a useCallback to prevent infinite loops
  const updateUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log("MessagesContext: Updating unread count for", user.username);
      const response = await api.get('/api/messages/unread-count');
      console.log("MessagesContext: Unread count response", response.data);
      
      // If there are unread messages, always fetch the latest
      if (response.data.count > 0) {
        console.log("MessagesContext: Unread messages detected, fetching latest messages");
        try {
          const messagesResponse = await api.get('/api/messages/conversations');
          console.log("MessagesContext: Fetched conversations:", messagesResponse.data);
          
          if (messagesResponse.data && messagesResponse.data.length > 0) {
            // Sort conversations by most recent message
            const sortedConversations = [...messagesResponse.data].sort((a, b) => {
              if (!a.lastMessage || !b.lastMessage) return 0;
              const dateA = new Date(a.lastMessage.timestamp || 0);
              const dateB = new Date(b.lastMessage.timestamp || 0);
              return dateB.getTime() - dateA.getTime();
            });
            
            // Find the first conversation with unread messages
            const unreadConversation = sortedConversations.find(conv => conv.unreadCount > 0);
            
            // If found, set as last message for notification
            if (unreadConversation && unreadConversation.lastMessage) {
              console.log("MessagesContext: Setting last message:", unreadConversation.lastMessage);
              setLastMessage(unreadConversation.lastMessage);
            }
          }
        } catch (error) {
          console.error('Error fetching latest message:', error);
        }
      }
      
      // Always update the unread count
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      // Don't update unread count on error to avoid losing previous count
    }
  }, [user]);

  // Fetch unread count whenever user changes
  useEffect(() => {
    if (user) {
      console.log("MessagesContext: User changed, updating unread count");
      updateUnreadCount();
      
      // Set up polling for new messages
      const interval = setInterval(() => {
        console.log("MessagesContext: Polling for unread messages");
        updateUnreadCount();
      }, 15000); // Check every 15 seconds (reduced from 30)
      
      return () => clearInterval(interval);
    }
  }, [user, updateUnreadCount]);

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <MessagesContext.Provider value={{ unreadCount, lastMessage, updateUnreadCount, resetUnreadCount, isInitialized }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}