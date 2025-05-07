'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card, CardHeader, CardContent, CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';

interface FeedbackPayload {
  userId?: string;
  rating: number;
  comment: string;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const token = localStorage.getItem("token");
    setSubmitting(true);
    try {
      const user = localStorage.getItem('user');
      const payload: FeedbackPayload = {
        userId: user ? JSON.parse(user).id : undefined,
        rating,
        comment
      };

      const res = await fetch('http://localhost:8080/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type':'application/json',
            'Authorization': `Bearer ${token}`
         },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to send feedback');

      toast({ title: 'Thank you!', description: 'Your feedback was sent.' });
      router.push('/');
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Could not send feedback.', variant:'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Send Us Your Feedback</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* star selector */}
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((n) => (
              <Star
                key={n}
                onClick={() => setRating(n)}
                className={`cursor-pointer ${n <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                size={24}
              />
            ))}
          </div>

          <Textarea
            placeholder="Your comments..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={4}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={submit}
            isLoading={submitting}
            disabled={submitting || comment.trim() === ''}
          >
            Send Feedback
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
