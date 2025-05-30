'use client';

import ChatBot from '@/components/ChatBot';

export default function ChatBotPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">AI Chat Assistant</h1>
      <ChatBot />
    </div>
  );
}