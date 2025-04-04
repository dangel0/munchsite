'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle } from 'lucide-react';

interface NewLetterFormProps {
  onLetterAdded: (letter: any) => void;
}

export function NewLetterForm({ onLetterAdded }: NewLetterFormProps) {
  const [title, setTitle] = useState('');
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!title.trim() || !to.trim() || !content.trim()) {
        throw new Error('Please fill in all required fields');
      }

      const data = {
        title: title.trim(),
        to: to.trim(),
        from: from.trim() || 'Anonymous',
        content: content.trim(),
        user: user?.id || '',  // Link to the current user
      };

      const record = await pb.collection('letters').create(data);
      onLetterAdded(record);
      
      // Clear form
      setTitle('');
      setTo('');
      setFrom('');
      setContent('');
    } catch (err: any) {
      console.error('Error adding letter:', err);
      setError(err.message || 'Failed to add letter');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Letter title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="to">To</Label>
        <Input
          id="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Who is this letter for?"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="from">From (optional)</Label>
        <Input
          id="from"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="Your name (leave blank to remain anonymous)"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Letter Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your letter here..."
          rows={8}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Letter'}
      </Button>
    </form>
  );
}
