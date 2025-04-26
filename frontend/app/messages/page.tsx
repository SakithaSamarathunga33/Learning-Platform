'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { useMessages } from '@/context/MessagesContext';
import api from '@/utils/api'; // Import the configured axios instance

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

interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

const MessagesPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userParam = searchParams.get('user');
  const { resetUnreadCount, updateUnreadCount } = useMessages();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.username);
    }
  }, [selectedChat]);

  // Handle user param from URL
  useEffect(() => {
    if (userParam && conversations.length > 0) {
      const foundUser = conversations.find(conv => conv.user.username === userParam);
      if (foundUser) {
        setSelectedChat(foundUser.user);
      } else {
        // If user is not in conversations, fetch their details
        fetchUserByUsername(userParam);
      }
    }
  }, [userParam, conversations]);

  // Reset unread count when viewing messages
  useEffect(() => {
    if (selectedChat) {
      resetUnreadCount();
    }
    
    return () => {
      // Update unread count when leaving the page
      updateUnreadCount();
    };
  }, [selectedChat, resetUnreadCount, updateUnreadCount]);

  // Fetch user by username
  const fetchUserByUsername = async (username: string) => {
    try {
      const response = await api.get(`/api/users/username/${username}`);
      if (response.data) {
        setSelectedChat(response.data);
      }
    } catch (err) {
      setError(`Failed to load user ${username}`);
      console.error('Error fetching user:', err);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/conversations`);
      setConversations(response.data);
      
      // If we have conversations and no chat is selected, select the first one
      if (response.data.length > 0 && !selectedChat) {
        setSelectedChat(response.data[0].user);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load conversations');
      setLoading(false);
      console.error('Error fetching conversations:', err);
    }
  };

  const fetchMessages = async (username: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/conversation/${username}`);
      setMessages(response.data);
      setLoading(false);
      
      // Mark as read in the conversations list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.user.username === username 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    } catch (err) {
      setError('Failed to load messages');
      setLoading(false);
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedChat || !newMessage.trim()) return;
    
    try {
      await api.post(`/api/messages/send/${selectedChat.username}`, {
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
        recipient: selectedChat
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage(''); // Clear input
      
      // Refresh the conversations to update the last message
      fetchConversations();
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && conversations.length === 0) {
    return <div className="flex justify-center items-center h-screen">Loading conversations...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Conversations List */}
        <div className="w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Conversations</h2>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-250px)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BsChat className="mx-auto text-4xl mb-2" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.user.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                    selectedChat?.id === conv.user.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedChat(conv.user)}
                >
                  <div className="relative">
                    {conv.user.avatarUrl ? (
                      <Image 
                        src={conv.user.avatarUrl} 
                        alt={conv.user.name} 
                        width={50} 
                        height={50} 
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-[50px] h-[50px] bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-700 dark:text-gray-300">
                          {conv.user.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    {conv.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{conv.user.name}</h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(conv.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage.sender.id === conv.user.id 
                          ? conv.lastMessage.content 
                          : `You: ${conv.lastMessage.content}`}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Area */}
        <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                {selectedChat.avatarUrl ? (
                  <Image 
                    src={selectedChat.avatarUrl} 
                    alt={selectedChat.name} 
                    width={40} 
                    height={40} 
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[40px] h-[40px] bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      {selectedChat.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-500">@{selectedChat.username}</p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-350px)]">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <BsChat className="text-4xl mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isCurrentUser = message.sender.username !== selectedChat.username;
                    
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
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
              <BsChat className="text-6xl mb-4" />
              <h3 className="text-xl font-medium mb-2">Your Messages</h3>
              <p className="text-center">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 