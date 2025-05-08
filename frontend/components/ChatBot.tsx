/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HfInference } from '@huggingface/inference';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Initialize HF client only if token exists
let hf: HfInference | null = null;
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_HUGGING_FACE_TOKEN) {
  hf = new HfInference(process.env.NEXT_PUBLIC_HUGGING_FACE_TOKEN);
}

interface Message {
  text: string;
  isBot: boolean;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<string>("");

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_HUGGING_FACE_TOKEN) {
      setError("Chat is temporarily unavailable. Please try again later.");
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (!hf) {
      setError("Chat service is not configured. Please try again later.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setIsLoading(true);
    setError(null);

    try {
      // Update conversation history with the user's message
      const updatedHistory = conversationHistory + (conversationHistory ? '\n' : '') + userMessage;
      
      const response = await hf.conversational({
        model: 'microsoft/DialoGPT-medium',
        inputs: {
          past_user_inputs: messages.filter(m => !m.isBot).map(m => m.text),
          generated_responses: messages.filter(m => m.isBot).map(m => m.text),
          text: userMessage,
        },
        parameters: {
          temperature: 0.7,
          max_length: 1000,
          top_p: 0.95,
          top_k: 50,
        }
      });

      if (response.generated_text) {
        const botResponse = response.generated_text.trim();
        setMessages(prev => [...prev, { 
          text: botResponse, 
          isBot: true 
        }]);
        setConversationHistory(updatedHistory + '\n' + botResponse);
      } else {
        throw new Error("No response generated");
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError("I encountered an error. Please try again in a moment.");
      setMessages(prev => [...prev, { 
        text: "I apologize, but I encountered an error. Please try again.", 
        isBot: true 
      }]);
    } finally {
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