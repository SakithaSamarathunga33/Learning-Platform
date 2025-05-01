'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/utils/api'; // Import the configured axios instance
import { FiSend, FiX } from 'react-icons/fi';
import { BsChat, BsArrowLeft } from 'react-icons/bs';
import { HiTrash } from 'react-icons/hi';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface ChatWindowProps {
  recipient: User;
  onClose?: () => void;
  isModal?: boolean;
}

const ChatWindow = ({ recipient, onClose, isModal = false }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Set up interval to periodically check for new messages (every 10 seconds)
    const intervalId = setInterval(fetchMessages, 10000);
    
    return () => clearInterval(intervalId);
  }, [recipient.username]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/conversation/${recipient.username}`);
      setMessages(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load messages');
      setLoading(false);
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      await api.post(`/api/messages/send/${recipient.username}`, {
        content: newMessage
      });
      
      // Add the new message to the messages list (optimistic update)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const tempMessage: Message = {
        id: Date.now().toString(), // Temporary ID
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl
        },
        recipient: recipient
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage(''); // Clear input
      
      // Refresh messages to get the actual message from the server
      setTimeout(fetchMessages, 1000);
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Add function to handle conversation deletion
  const handleDeleteConversation = async () => {
    if (confirm(`Are you sure you want to delete your conversation with ${recipient.name}?`)) {
      try {
        setLoading(true);
        
        // Try to delete on the server
        try {
          await api.delete(`/api/messages/conversation/${recipient.username}`);
        } catch (err) {
          console.error('Error deleting conversation on server:', err);
          // Continue with local deletion even if server deletion fails
        }
        
        // Delete locally regardless of server response
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Remove ALL possible localStorage keys for this conversation
        // Standard key format
        localStorage.removeItem(`messages_${currentUser.id}_${recipient.id}`);
        
        // Delete flag
        localStorage.removeItem(`messages_${currentUser.id}_${recipient.id}_deleted`);
        
        // Alternative key formats that might exist
        localStorage.removeItem(`chat_${currentUser.id}_${recipient.id}`);
        localStorage.removeItem(`chat_${currentUser.username}_${recipient.username}`);
        
        // Backward compatibility for other formats
        localStorage.removeItem(`messages_${recipient.id}`);
        localStorage.removeItem(`messages_${recipient.username}`);
        localStorage.removeItem(`messages_${currentUser.id}_${recipient.username}`);
        
        // Force clean LocalStorage for any keys containing this user's ID
        Object.keys(localStorage).forEach(key => {
          if (key.includes(recipient.id) || key.includes(recipient.username)) {
            localStorage.removeItem(key);
          }
        });
        
        // Create a custom event to notify other components about the deleted conversation
        const event = new CustomEvent('conversationDeleted', { 
          detail: { 
            userId: recipient.id,
            username: recipient.username
          } 
        });
        window.dispatchEvent(event);
        
        // Clear messages
        setMessages([]);
        
        // Close the chat window if in modal
        if (onClose) {
          onClose();
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to delete conversation');
        setLoading(false);
        console.error('Error deleting conversation:', err);
      }
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden ${isModal ? 'h-full' : 'h-[calc(100vh-180px)]'}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isModal && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <BsArrowLeft size={20} />
            </button>
          )}
          
          <Link href={`/profile/${recipient.username}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipient.avatarUrl} alt={recipient.name} />
              <AvatarFallback>{recipient.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-medium">{recipient.name}</h3>
              <p className="text-sm text-gray-500">@{recipient.username}</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteConversation}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Delete this conversation"
          >
            <HiTrash size={20} />
          </button>
          
          {onClose && !isModal && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <BsChat className="text-4xl mb-2" />
            <p>No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message</p>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.sender.id !== recipient.id;
            
            return (
              <div 
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isCurrentUser 
                      ? 'bg-blue-500 text-white rounded-tr-none' 
                      : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
            disabled={!newMessage.trim()}
          >
            <FiSend size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;