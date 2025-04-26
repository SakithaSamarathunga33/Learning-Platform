'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/utils/api'; // Import the configured axios instance

interface MessagesContextType {
  unreadCount: number;
  updateUnreadCount: () => Promise<void>;
  resetUnreadCount: () => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    // Listen for user changes (login/logout)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (error) {
          console.error('Error parsing updated user:', error);
        }
      } else {
        setUser(null);
        setUnreadCount(0);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChange', handleStorageChange);
    };
  }, []);

  // Fetch unread count whenever user changes
  useEffect(() => {
    if (user) {
      updateUnreadCount();
      
      // Set up polling for new messages
      const interval = setInterval(updateUnreadCount, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const updateUnreadCount = async () => {
    if (!user) return;
    
    try {
      const response = await api.get('/api/messages/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
    }
  };

  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  return (
    <MessagesContext.Provider value={{ unreadCount, updateUnreadCount, resetUnreadCount }}>
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