/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "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";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "deepseek/deepseek-chat-v3-0324:free";

interface Message {
  text: string;
  isBot: boolean;
}

// Fallback responses when AI model is unavailable
const fallbackResponses = {
  greeting: [
    "Hello! How can I help you today?",
    "Hi there! What can I assist you with?",
    "Welcome! How may I help you?",
    "Greetings! What would you like to know?"
  ],
  default: [
    "That's an interesting question. Let me think about that.",
    "I understand what you're asking. Let me provide some information.",
    "Thanks for your question. Here's what I can tell you.",
    "I appreciate your inquiry. Let me share what I know."
  ],
  unsure: [
    "I'm not sure I understand. Could you please rephrase that?",
    "I don't have enough information to answer that properly.",
    "I'm having trouble understanding your question. Could you try asking differently?",
    "I don't have a specific answer for that at the moment."
  ],
  aboutWebsite: [
    "This is a learning platform where you can take courses, earn achievements, connect with other learners, and track your educational progress.",
    "Our platform offers various educational courses and allows you to connect with fellow students while tracking your achievements.",
    "This website helps you learn new skills, earn certificates, and connect with a community of learners."
  ]
};

// Get a random response from a category
const getRandomResponse = (category: keyof typeof fallbackResponses) => {
  const responses = fallbackResponses[category];
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [usesFallback, setUsesFallback] = useState<boolean>(false);

  // Check if the API key is available and test connection
  useEffect(() => {
    if (!OPENROUTER_API_KEY) {
      setError("Chat is temporarily unavailable. Please add an OpenRouter API key.");
      setUsesFallback(true);
      return;
    }

    console.log("Testing OpenRouter connection with model:", MODEL_NAME);
    
    // Set usesFallback to false initially
    setUsesFallback(false);

    // Test if we can use the OpenRouter API
    const testConnection = async () => {
      try {
        // Simple test message
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.origin || "https://learning-platform.app",
            'X-Title': 'Learning Platform Chat'
          },
          body: JSON.stringify({
            model: MODEL_NAME,
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 10,
            temperature: 0.7
          })
        });
        
        console.log("OpenRouter test response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("OpenRouter API error:", errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("OpenRouter test successful, model is working");
        setUsesFallback(false);
      } catch (error) {
        console.error("OpenRouter API test failed:", error);
        setError("Chat AI model is temporarily unavailable. Using fallback responses.");
        setUsesFallback(true);
      }
    };

    testConnection();
  }, []);

  const getFallbackResponse = (message: string) => {
    const messageLower = message.toLowerCase();
    
    // Check for greetings
    if (messageLower.match(/^(hello|hi|hey|greetings|howdy)/)) {
      return getRandomResponse('greeting');
    }
    
    // Check for questions about the website
    if (messageLower.includes("website") || 
        messageLower.includes("platform") || 
        messageLower.includes("this site") ||
        messageLower.includes("about this") ||
        messageLower.includes("what is this")) {
      return getRandomResponse('aboutWebsite');
    }
    
    // Check if message has question words but no clear topic
    if ((messageLower.includes("what") || 
         messageLower.includes("how") || 
         messageLower.includes("why") || 
         messageLower.includes("when") || 
         messageLower.includes("where")) && 
        messageLower.length < 15) {
      return getRandomResponse('unsure');
    }
    
    // Default response
    return getRandomResponse('default');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);
    setError(null);

    try {
      // Add user message to conversation history
      const updatedHistory = [...conversationHistory, { text: userMessage, isBot: false }];
      setConversationHistory(updatedHistory);
      
      // Only handle time/date queries directly - let AI respond to all other topics
      const userMessageLower = userMessage.toLowerCase();
      let specialResponse = null;
      
      // Time and date related responses
      if (userMessageLower.includes("time") && 
          (userMessageLower.includes("what") || userMessageLower.includes("current") || userMessageLower.includes("now"))) {
        const now = new Date();
        specialResponse = `The current time is ${now.toLocaleTimeString()}.`;
      }
      else if (userMessageLower.includes("date") && 
              (userMessageLower.includes("what") || userMessageLower.includes("current") || userMessageLower.includes("today"))) {
        const now = new Date();
        specialResponse = `Today's date is ${now.toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}.`;
      }
      else if ((userMessageLower.includes("day") || userMessageLower.includes("today")) && 
              (userMessageLower.includes("what") || userMessageLower.includes("which"))) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const now = new Date();
        specialResponse = `Today is ${days[now.getDay()]}.`;
      }
      
      let botResponse = '';
      
      if (specialResponse) {
        botResponse = specialResponse;
      } else if (!usesFallback) {
        try {
          console.log("Sending message to OpenRouter:", userMessage);
          
          // Format conversation history for the OpenRouter API
          const formattedMessages = conversationHistory.map(msg => ({
            role: msg.isBot ? "assistant" : "user",
            content: msg.text
          }));
          
          // Add the current user message
          formattedMessages.push({
            role: "user",
            content: userMessage
          });
          
          console.log("Formatted messages:", JSON.stringify(formattedMessages));
          
          // Call the OpenRouter API
          const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'HTTP-Referer': window.location.origin || "https://learning-platform.app",
              'X-Title': 'Learning Platform Chat'
            },
            body: JSON.stringify({
              model: MODEL_NAME,
              messages: formattedMessages,
          temperature: 0.7,
              max_tokens: 500
            })
          });
          
          console.log("OpenRouter response status:", response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API error:", errorText);
            throw new Error(`API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log("OpenRouter response:", data);
          
          botResponse = data.choices?.[0]?.message?.content || "";
          
          if (!botResponse) {
            console.error("No response content from OpenRouter");
            throw new Error("Empty response from API");
          }
          
          console.log("Bot response from OpenRouter:", botResponse);
        } catch (error) {
          console.error("AI model error:", error);
          botResponse = getFallbackResponse(userMessage);
        }
      } else {
        // Use fallback response system
        console.log("Using fallback response system");
        botResponse = getFallbackResponse(userMessage);
      }

      // Add bot response to messages and history
      const botMessage = { text: botResponse, isBot: true };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setConversationHistory(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 500); // Small delay to make it feel more natural
      
    } catch (error) {
      console.error("Error in chat:", error);
      setError("I encountered an error. Please try again in a moment.");
      setMessages(prev => [...prev, { 
        text: "I apologize, but I encountered an error. Please try again.", 
        isBot: true 
      }]);
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto h-[500px] flex flex-col">
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.isBot 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <CardContent className="border-t p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && !error && handleSend()}
            disabled={isLoading || !!error}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || !input.trim() || !!error}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}