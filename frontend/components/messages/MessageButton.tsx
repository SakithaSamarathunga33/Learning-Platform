'use client';

import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MessageButtonProps {
  targetUserId: string;
  username: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 
           'ghost' | 'link' | null | undefined;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
  className?: string;
  onClick?: () => void;
}

export default function MessageButton({
  targetUserId,
  username,
  variant = 'outline',
  size = 'sm',
  className = '',
  onClick
}: MessageButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to messages page with the recipient pre-selected
      router.push(`/messages?user=${username}`);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Message
    </Button>
  );
} 