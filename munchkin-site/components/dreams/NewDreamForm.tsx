'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NewDreamFormProps {
  onDreamAdded: (dream: any) => void;
}

export function NewDreamForm({ onDreamAdded }: NewDreamFormProps) {
  const [title, setTitle] = useState('');
  const [dream, setDream] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const newDream = await pb.collection('dreams').create({
        title,
        dream,
        user: user.name
      });

      // Reset form
      setTitle('');
      setDream('');
      
      // Call the callback function to update the parent component
      onDreamAdded(newDream);
    } catch (err: any) {
      console.error('Error adding dream:', err);
      
      // Provide more specific error messages based on the error
      if (err.status === 0) {
        setError('Connection to database failed. Please check if the PocketBase server is running.');
      } else if (err.status === 403) {
        setError('You do not have permission to add dreams.');
      } else {
        setError(err.message || 'Failed to add dream');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="title">Dream Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter a title for your dream"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dream">Dream Content</Label>
        <Textarea
          id="dream"
          value={dream}
          onChange={(e) => setDream(e.target.value)}
          required
          rows={5}
          placeholder="Describe your dream here..."
          className="min-h-[120px]"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding Dream...' : 'Add Dream'}
      </Button>
    </form>
  );
}
