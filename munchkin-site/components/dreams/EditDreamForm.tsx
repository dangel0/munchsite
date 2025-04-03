'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditDreamFormProps {
  dream: {
    id: string;
    title: string;
    dream: string;
    user?: string;
  };
  onDreamEdited: () => void;
  onCancel: () => void;
}

export function EditDreamForm({ dream, onDreamEdited, onCancel }: EditDreamFormProps) {
  const [title, setTitle] = useState(dream.title);
  const [dreamContent, setDreamContent] = useState(dream.dream);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await pb.collection('dreams').update(dream.id, {
        title,
        dream: dreamContent,
      });
      onDreamEdited();
    } catch (err: any) {
      console.error('Error updating dream:', err);
      
      if (err.status === 0) {
        setError('Connection to database failed. Please check if the PocketBase server is running.');
      } else if (err.status === 403) {
        setError('You do not have permission to edit this dream.');
      } else {
        setError(err.message || 'Failed to update dream');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-6">
      <div className="text-lg font-semibold mb-4">Edit Dream</div>
      
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
          value={dreamContent}
          onChange={(e) => setDreamContent(e.target.value)}
          required
          rows={8}
          placeholder="Describe your dream here..."
          className="min-h-[200px]"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
