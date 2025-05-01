'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSend } from 'react-icons/fi';
import { BsChat } from 'react-icons/bs';
import { HiPencil, HiTrash } from 'react-icons/hi';
import { useMessages } from '@/context/MessagesContext';
import api from '@/utils/api'; // Import the configured axios instance
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
  isLocal?: boolean; // Flag to indicate if this is a local message
  edited?: boolean;  // Flag to indicate if message was edited
  hidden?: boolean; // Flag to indicate if message is hidden
  replacedBy?: string; // ID of the message that replaces this one
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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  // Load messages from local storage
  useEffect(() => {
    const loadLocalMessages = () => {
      if (selectedChat) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const localStorageKey = `messages_${currentUser.id}_${selectedChat.id}`;
        const savedMessages = localStorage.getItem(localStorageKey);
        
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          // Merge API messages with local messages
          setMessages(prevMessages => {
            // Filter out any local messages that might be duplicated
            const apiMessages = prevMessages.filter(m => !m.isLocal);
            return [...apiMessages, ...parsedMessages];
          });
        }
      }
    };
    
    loadLocalMessages();
  }, [selectedChat]);

  // Save messages to local storage whenever they change
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const localStorageKey = `messages_${currentUser.id}_${selectedChat.id}`;
      
      // Only save local messages
      const localMessages = messages.filter(m => m.isLocal);
      if (localMessages.length > 0) {
        localStorage.setItem(localStorageKey, JSON.stringify(localMessages));
      }
    }
  }, [messages, selectedChat]);

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

  // Add a useEffect to listen for conversation deleted events
  useEffect(() => {
    // Event handler for when a conversation is deleted elsewhere
    const handleConversationDeleted = (event: CustomEvent) => {
      const { userId, username } = event.detail;
      
      // Remove this conversation from the conversations list
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.user.id !== userId)
      );
      
      // If this was the selected chat, select another one or clear the selection
      if (selectedChat && selectedChat.id === userId) {
        const nextConversation = conversations.find(conv => conv.user.id !== userId);
        if (nextConversation) {
          setSelectedChat(nextConversation.user);
        } else {
          setSelectedChat(null);
        }
        
        // Clear the current messages
        setMessages([]);
      }
    };
    
    // Add event listener for custom event
    window.addEventListener('conversationDeleted', handleConversationDeleted as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('conversationDeleted', handleConversationDeleted as EventListener);
    };
  }, [selectedChat, conversations]);

  // Updated fetchConversations function to better handle deleted conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/conversations`);
      
      // Get current user to check for locally deleted conversations
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Filter out conversations that were deleted locally
      const filteredConversations = response.data.filter(conversation => {
        // Check all possible deletion indicators in localStorage
        const standardKey = `messages_${currentUser.id}_${conversation.user.id}`;
        const deletedFlag = localStorage.getItem(`${standardKey}_deleted`);
        
        // Look for any localStorage keys that indicate this conversation was deleted
        const wasDeleted = Object.keys(localStorage).some(key => 
          (key.includes(conversation.user.id) || key.includes(conversation.user.username)) && 
          key.includes('_deleted')
        );
        
        return !deletedFlag && !wasDeleted;
      });
      
      // Process each conversation to ensure we're showing the latest message
      const processedConversations = filteredConversations.map(conversation => {
        // Identify if this conversation is the currently selected one
        const isSelectedConversation = selectedChat && selectedChat.id === conversation.user.id;
        
        // If it's the selected conversation, we might have more up-to-date messages in state
        if (isSelectedConversation && messages.length > 0) {
          // Filter out hidden and replaced messages
          const visibleMessages = messages.filter(msg => !msg.hidden && !msg.replacedBy);
          
          // Sort by timestamp (newest first)
          visibleMessages.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          
          // If we have messages, use the most recent one as the lastMessage
          if (visibleMessages.length > 0) {
            return {
              ...conversation,
              lastMessage: visibleMessages[0]
            };
          }
        }
        
        return conversation;
      });
      
      setConversations(processedConversations);
      
      // If we have conversations and no chat is selected, select the first one
      if (processedConversations.length > 0 && !selectedChat) {
        setSelectedChat(processedConversations[0].user);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load conversations');
      setLoading(false);
      console.error('Error fetching conversations:', err);
    }
  };

  // Modify the fetchMessages function to identify and hide original messages
  const fetchMessages = async (username: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/messages/conversation/${username}`);
      
      // Get current user from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const localStorageKey = `messages_${currentUser.id}_${selectedChat?.id}`;
      const savedMessages = localStorage.getItem(localStorageKey) || '[]';
      let localMessages: Message[] = JSON.parse(savedMessages);
      
      // Process API messages and ensure they have all required properties
      const apiMessages = response.data.map((msg: Message) => ({
        ...msg,
        edited: msg.edited || false // Ensure edited flag is present
      }));
      
      // Identify edited messages and their originals
      const allMessages = [...apiMessages, ...localMessages];
      const editedMessages = allMessages.filter(msg => isEditNotification(msg.content));
      
      // Create a map of original message IDs to their edited versions
      const originalToEditedMap: Record<string, string> = {};
      
      // For each edited message, find its likely original
      editedMessages.forEach(editedMsg => {
        const originalId = findOriginalMessageId(editedMsg, allMessages);
        if (originalId) {
          originalToEditedMap[originalId] = editedMsg.id;
        }
      });
      
      // Mark original messages as replaced
      apiMessages.forEach(msg => {
        if (originalToEditedMap[msg.id]) {
          msg.replacedBy = originalToEditedMap[msg.id];
        }
      });
      
      localMessages.forEach(msg => {
        if (originalToEditedMap[msg.id]) {
          msg.replacedBy = originalToEditedMap[msg.id];
        }
      });
      
      // Get all message IDs that have replacements
      const replacedMessageIds = new Set(
        [...apiMessages, ...localMessages]
          .filter(m => m.replacedBy)
          .map(m => m.id)
      );
      
      // Filter out messages that have been replaced
      const filteredApiMessages = apiMessages.filter(m => !replacedMessageIds.has(m.id));
      
      // Combine API messages with local messages, preserving edited status
      const apiMessageIds = new Set(filteredApiMessages.map((m: Message) => m.id));
      const validLocalMessages = localMessages.filter(m => 
        (!apiMessageIds.has(m.id) || m.edited) && !replacedMessageIds.has(m.id)
      );
      
      // For local messages that edit API messages, replace the API version
      const combinedMessages = filteredApiMessages.map((apiMsg: Message) => {
        const localEdit = localMessages.find(localMsg => 
          localMsg.id === apiMsg.id && localMsg.edited
        );
        return localEdit || apiMsg;
      });
      
      // Add local messages that don't exist in API response
      const uniqueLocalMessages = localMessages.filter(m => 
        !apiMessageIds.has(m.id) && !replacedMessageIds.has(m.id)
      );
      
      // Combine all messages and sort by timestamp
      const finalMessages = [...combinedMessages, ...uniqueLocalMessages];
      finalMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Save updated message replacements to local storage
      localStorage.setItem(localStorageKey, JSON.stringify([
        ...localMessages.filter(m => m.replacedBy),
        ...uniqueLocalMessages
      ]));
      
      setMessages(finalMessages);
      setLoading(false);
      
      // Mark as read in the conversations list
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.user.username === username 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
      
      // Update the conversation list to show the correct last message
      fetchConversations();
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
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Create a temporary message for optimistic UI update
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
      
      // Add the new message to the messages list (optimistic update)
      setMessages(prev => {
        const updatedMessages = [...prev, tempMessage];
        // Sort messages by timestamp
        updatedMessages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        return updatedMessages;
      });
      
      // Clear input immediately for better UX
      setNewMessage('');
      
      // Update the conversation list immediately with the new message
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.user.id === selectedChat.id 
            ? { ...conv, lastMessage: tempMessage } 
            : conv
        )
      );
      
      // Send to server
      await api.post(`/api/messages/send/${selectedChat.username}`, {
        content: newMessage
      });
      
      // Refresh the conversations to update with server data
      fetchConversations();
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    // Check if this is an API message or local message
    const messageToDelete = messages.find(m => m.id === messageId);
    
    if (!messageToDelete) return;

    // Check if this is an edited message or if it has been replaced
    const isEdited = isEditNotification(messageToDelete.content);
    const hasReplaced = messages.some(m => m.replacedBy === messageId);
    
    // Find any related messages (originals this message replaced or messages that replaced this one)
    const replacedByThisMessage = messages.filter(m => m.replacedBy === messageId);
    const replacementOfThisMessage = messages.find(m => messageId === m.replacedBy);
    
    // Remove from UI (optimistic update)
    setMessages(prevMessages => {
      // First remove the target message
      let updatedMessages = prevMessages.filter(m => m.id !== messageId);
      
      // If this is an edited message, also remove any messages it replaced
      if (isEdited) {
        updatedMessages = updatedMessages.filter(m => m.replacedBy !== messageId);
      }
      
      // If this message was replaced by another message, make that one visible
      if (messageToDelete.replacedBy) {
        updatedMessages = updatedMessages.map(m => 
          m.id === messageToDelete.replacedBy 
            ? { ...m, hidden: false } 
            : m
        );
      }
      
      return updatedMessages;
    });
    
    // If this was the last message in the conversation, update the conversation list
    if (selectedChat) {
      const remainingMessages = messages.filter(m => 
        m.id !== messageId && !m.hidden && !m.replacedBy && 
        // Also filter out messages this message replaced
        (isEdited ? m.replacedBy !== messageId : true)
      );
      
      // Sort by timestamp (newest first)
      remainingMessages.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      // If we still have messages, use the most recent one as the lastMessage
      if (remainingMessages.length > 0) {
        setConversations(prevConversations => 
          prevConversations.map(conv => {
            if (conv.user.id === selectedChat.id) {
              return {
                ...conv,
                lastMessage: remainingMessages[0]
              };
            }
            return conv;
          })
        );
      }
    }
    
    // Now handle the actual deletion
    if (messageToDelete.isLocal) {
      // If it's a local message, handle local storage cleanup
      if (selectedChat) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const localStorageKey = `messages_${currentUser.id}_${selectedChat.id}`;
        const savedMessages = localStorage.getItem(localStorageKey) || '[]';
        let localMessages: Message[] = JSON.parse(savedMessages);
        
        // Create a new array for the updated messages
        let updatedLocalMessages: Message[] = [];
        
        // Process each message
        for (const msg of localMessages) {
          // Skip the message being deleted
          if (msg.id === messageId) continue;
          
          // If this is an edited message being deleted, skip messages it replaced
          if (isEdited && msg.replacedBy === messageId) continue;
          
          // If this message was replaced by the one being deleted, restore it
          if (msg.replacedBy === messageId) {
            updatedLocalMessages.push({
              ...msg,
              replacedBy: undefined,
              hidden: false
            });
          } else {
            // Keep other messages unchanged
            updatedLocalMessages.push(msg);
          }
        }
        
        // Save the updated messages back to localStorage
        localStorage.setItem(localStorageKey, JSON.stringify(updatedLocalMessages));
      }
    } else {
      // If it's an API message, call the API
      api.delete(`/api/messages/${messageId}`)
        .then(() => {
          // After successful deletion, refresh messages if this was an edit
          // or if this message was edited by another message
          if (selectedChat && (isEdited || hasReplaced)) {
            fetchMessages(selectedChat.username);
          }
        })
        .catch(err => {
          setError('Failed to delete message');
          console.error('Error deleting message:', err);
          // Revert the optimistic update if the server call fails
          fetchMessages(selectedChat!.username);
        });
    }
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = (messageId: string) => {
    if (!editContent.trim()) return;
    
    // Find the message being edited
    const messageToEdit = messages.find(m => m.id === messageId);
    
    if (messageToEdit && selectedChat) {
      // Create a new message ID for the edited message
      const newMessageId = Date.now().toString();
      
      // Mark the original message as replaced in local state
      setMessages(prevMessages => 
        prevMessages.map(m => 
          m.id === messageId 
            ? { ...m, replacedBy: newMessageId, hidden: true } 
            : m
        )
      );
      
      // Create the edited message with proper format
      const originalTimestamp = formatTimestamp(messageToEdit.timestamp);
      const editedMessage: Message = {
        id: newMessageId,
        content: `[Edited ${originalTimestamp}]: ${editContent}`,
        timestamp: new Date().toISOString(),
        read: false,
        sender: {
          id: JSON.parse(localStorage.getItem('user') || '{}').id,
          name: JSON.parse(localStorage.getItem('user') || '{}').name,
          username: JSON.parse(localStorage.getItem('user') || '{}').username,
          avatarUrl: JSON.parse(localStorage.getItem('user') || '{}').avatarUrl
        },
        recipient: selectedChat,
        isLocal: true
      };
      
      // Add the new message to the UI
      setMessages(prev => [...prev, editedMessage]);
      
      // Send the edited message to the server
      api.post(`/api/messages/send/${selectedChat.username}`, {
        content: editedMessage.content
      })
      .then(() => {
        // Update the conversation list
        fetchConversations();
      })
      .catch(err => {
        setError('Failed to send edited message');
        console.error('Error sending edited message:', err);
      });
      
      // Store the edit information in local storage
      // This will be used to hide the original message when reloading
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const localStorageKey = `messages_${currentUser.id}_${selectedChat.id}`;
      const savedMessages = localStorage.getItem(localStorageKey) || '[]';
      let localMessages: Message[] = JSON.parse(savedMessages);
      
      // Add/update the replaced message marker
      const replacedMessageIndex = localMessages.findIndex(m => m.id === messageId);
      if (replacedMessageIndex >= 0) {
        localMessages[replacedMessageIndex] = {
          ...localMessages[replacedMessageIndex],
          replacedBy: newMessageId,
          hidden: true
        };
      } else {
        localMessages.push({
          ...messageToEdit,
          replacedBy: newMessageId,
          hidden: true,
          isLocal: true
        });
      }
      
      // Add the new edited message
      localMessages.push(editedMessage);
      
      // Save to local storage
      localStorage.setItem(localStorageKey, JSON.stringify(localMessages));
    }
    
    setEditingMessageId(null);
    setEditContent('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get initials from a name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Add a new function to detect if a message is an edit notification
  const isEditNotification = (content: string): boolean => {
    return content.startsWith('[Edited ') && content.includes(']: ');
  };

  // Add a function to extract the original content from an edit notification
  const extractEditedContent = (content: string): string => {
    if (!isEditNotification(content)) return content;
    const match = content.match(/\[Edited [^\]]+\]: (.+)/);
    return match ? match[1] : content;
  };

  // Add back the function to detect if a message is likely the original of an edited message
  const findOriginalMessageId = (editedMessage: Message, allMessages: Message[]): string | null => {
    // Check if this is an edit notification
    if (!isEditNotification(editedMessage.content)) {
      return null;
    }

    // Extract time from the edited message format [Edited XX:XX XX]:
    const timeMatch = editedMessage.content.match(/\[Edited ([^\]]+)\]:/);
    if (!timeMatch) return null;
    
    const editTime = timeMatch[1];
    
    // Extract the content without the edit prefix
    const editedContent = extractEditedContent(editedMessage.content);
    
    // Find messages from the same sender, sent around the same time, with similar content
    const possibleOriginals = allMessages.filter(msg => 
      msg.id !== editedMessage.id &&
      msg.sender.id === editedMessage.sender.id &&
      // Don't consider other edit notifications
      !isEditNotification(msg.content) &&
      // Message was sent before the edit notification
      new Date(msg.timestamp) <= new Date(editedMessage.timestamp) &&
      // Message was sent within 2 minutes of the edit
      Math.abs(new Date(msg.timestamp).getTime() - new Date(editedMessage.timestamp).getTime()) < 2 * 60 * 1000
    );

    // If we found possible originals, return the most recent one
    if (possibleOriginals.length > 0) {
      // Sort by timestamp descending
      possibleOriginals.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      return possibleOriginals[0].id;
    }

    return null;
  };

  // In the message rendering section, filter out replaced messages
  const filteredMessages = messages.filter(msg => !msg.replacedBy && !msg.hidden);

  // Update handleDeleteConversation to completely clean localStorage
  const handleDeleteConversation = async () => {
    if (!selectedChat) return;
    
    if (confirm(`Are you sure you want to delete your conversation with ${selectedChat.name}?`)) {
      try {
        setLoading(true);
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Instead of trying to delete the entire conversation at once (which gives 403),
        // we'll delete locally and mark as deleted in localStorage
        
        // First try to delete individual messages if possible
        try {
          // Get all messages where current user is the sender (can only delete our own messages)
          const userMessages = filteredMessages.filter(msg => 
            msg.sender.id === currentUser.id || msg.sender.username === currentUser.username
          );
          
          // Delete each individual message through the API
          const deletionPromises = userMessages.map(msg => 
            api.delete(`/api/messages/${msg.id}`)
              .catch(err => {
                // If deletion of individual message fails, just log it and continue
                console.log(`Could not delete message ${msg.id}:`, err.message);
              })
          );
          
          // Wait for all deletion attempts to complete
          await Promise.allSettled(deletionPromises);
        } catch (err) {
          // If there's an error deleting individual messages, just continue with local deletion
          console.log('Could not delete individual messages:', err.message);
        }
        
        // Delete locally regardless of server response
        
        // Remove ALL possible localStorage keys for this conversation
        // Standard key format
        localStorage.removeItem(`messages_${currentUser.id}_${selectedChat.id}`);
        
        // Delete flag - explicitly mark as deleted
        localStorage.setItem(`messages_${currentUser.id}_${selectedChat.id}_deleted`, 'true');
        
        // Alternative key formats that might exist
        localStorage.removeItem(`chat_${currentUser.id}_${selectedChat.id}`);
        localStorage.removeItem(`chat_${currentUser.username}_${selectedChat.username}`);
        
        // Backward compatibility for other formats
        localStorage.removeItem(`messages_${selectedChat.id}`);
        localStorage.removeItem(`messages_${selectedChat.username}`);
        localStorage.removeItem(`messages_${currentUser.id}_${selectedChat.username}`);
        
        // Force clean LocalStorage for any keys containing this user's ID or username
        Object.keys(localStorage).forEach(key => {
          if ((key.includes(selectedChat.id) || key.includes(selectedChat.username)) && 
              !key.includes('_deleted')) {
            // For regular keys, just remove them
            localStorage.removeItem(key);
          } else if ((key.includes(selectedChat.id) || key.includes(selectedChat.username)) && 
                     key.includes('_deleted')) {
            // For deletion marker keys, set them to true
            localStorage.setItem(key, 'true');
          }
        });
        
        // Dispatch event to notify other components
        const event = new CustomEvent('conversationDeleted', { 
          detail: { 
            userId: selectedChat.id,
            username: selectedChat.username
          } 
        });
        window.dispatchEvent(event);
        
        // Clear messages from state
        setMessages([]);
        
        // Remove this conversation from the conversations list
        setConversations(prevConversations => 
          prevConversations.filter(conv => conv.user.id !== selectedChat.id)
        );
        
        // If there are other conversations, select the first one
        if (conversations.length > 1) {
          const nextConversation = conversations.find(conv => conv.user.id !== selectedChat.id);
          if (nextConversation) {
            setSelectedChat(nextConversation.user);
          }
        } else {
          setSelectedChat(null);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to delete conversation locally');
        setLoading(false);
        console.error('Error deleting conversation:', err);
      }
    }
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
              conversations.map((conversation) => (
                <div 
                  key={conversation.user.id}
                  className={`p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                    selectedChat && selectedChat.id === conversation.user.id 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : ''
                  }`}
                  onClick={() => setSelectedChat(conversation.user)}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.user.avatarUrl} alt={conversation.user.name} />
                      <AvatarFallback>{getInitials(conversation.user.name)}</AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{conversation.user.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage ? conversation.lastMessage.content : 'No messages yet'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Chat Window */}
        <div className="w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.avatarUrl} alt={selectedChat.name} />
                    <AvatarFallback>{getInitials(selectedChat.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-medium">{selectedChat.name}</h2>
                    <p className="text-sm text-gray-500">@{selectedChat.username}</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Delete this conversation"
                >
                  <HiTrash size={20} />
                </button>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-350px)]">
                {filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500">
                    <BsChat className="text-4xl mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation by sending a message</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => {
                    const isCurrentUser = message.sender.username !== selectedChat.username;
                    
                    return (
                      <div 
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`relative max-w-[70%] rounded-lg p-3 group 
                            ${isCurrentUser 
                              ? 'bg-blue-500 text-white rounded-tr-none' 
                              : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
                            } 
                            ${isEditNotification(message.content) 
                              ? 'border-l-4 border-amber-400 dark:border-amber-600' 
                              : ''
                            }`}
                        >
                          {editingMessageId === message.id ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 rounded text-black border border-gray-300"
                                rows={3}
                              />
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setEditingMessageId(null)} 
                                  className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-sm"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => handleSaveEdit(message.id)} 
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {isEditNotification(message.content) ? (
                                <div>
                                  <p>{extractEditedContent(message.content)}</p>
                                  <div className={`text-xs mt-1 flex items-center ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                    <span className="italic opacity-80 mr-2">{formatTimestamp(message.timestamp)}</span>
                                    <span className="bg-amber-400 dark:bg-amber-600 text-xs px-1.5 py-0.5 rounded-full text-white">
                                      edited
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p>{message.content}</p>
                                  <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {formatTimestamp(message.timestamp)}
                                    {message.edited && <span className="ml-2 italic opacity-80">(edited)</span>}
                                  </div>
                                </>
                              )}
                              
                              {/* Action buttons (only visible on hover and for current user's messages) */}
                              {isCurrentUser && (
                                <div className="absolute -top-2 -right-2 hidden group-hover:flex gap-1 bg-white dark:bg-gray-800 rounded-full shadow-md p-0.5">
                                  {!isEditNotification(message.content) && (
                                    <button 
                                      onClick={() => handleEditMessage(message)} 
                                      className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                      title="Edit message"
                                    >
                                      <HiPencil size={14} />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteMessage(message.id)} 
                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    title="Delete message"
                                  >
                                    <HiTrash size={14} />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
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