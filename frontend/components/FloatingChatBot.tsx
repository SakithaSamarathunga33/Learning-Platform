'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import ChatBot from './ChatBot';

export default function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 p-0"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] p-0">
          <DialogTitle className="px-6 pt-6">Chat with AI Assistant</DialogTitle>
          <DialogDescription className="px-6 pb-2">
            Ask questions about the learning platform or get help with your courses.
          </DialogDescription>
          <ChatBot />
        </DialogContent>
      </Dialog>
    </>
  );
}