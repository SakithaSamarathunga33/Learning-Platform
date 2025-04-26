'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/utils/api'; // Import the configured axios instance
import { FiSend, FiX } from 'react-icons/fi';
import { BsChat, BsArrowLeft } from 'react-icons/bs';

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
            {recipient.avatarUrl ? (
              <Image 
                src={recipient.avatarUrl} 
                alt={recipient.name} 
                width={40} 
                height={40} 
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-[40px] h-[40px] bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                  {recipient.name.charAt(0)}
                </span>
              </div>
            )}
            
            <div>
              <h3 className="font-medium">{recipient.name}</h3>
              <p className="text-sm text-gray-500">@{recipient.username}</p>
            </div>
          </Link>
        </div>
        
        {onClose && !isModal && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FiX size={20} />
          </button>
        )}
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
            disabled={loading && messages.length === 0}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center w-10 h-10"
            disabled={!newMessage.trim() || (loading && messages.length === 0)}
          >
            <FiSend size={20} />
          </button>
        </div>
        
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
      </form>
    </div>
  );
};

export default ChatWindow; 