'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditReviewFormProps {
  review: any;
  category: string;
  onReviewUpdated: (review: any) => void;
}

export function EditReviewForm({ review, category, onReviewUpdated }: EditReviewFormProps) {
  const [title, setTitle] = useState(review.title || '');
  const [description, setDescription] = useState(review.description || '');
  const [rating, setRating] = useState<number>(review.rating || 7);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const updatedReview = await pb.collection('reviews').update(review.id, {
        title,
        description,
        rating,
        // We don't update the user or category fields
      });

      onReviewUpdated(updatedReview);
    } catch (err: any) {
      console.error('Error updating review:', err);
      
      if (err.status === 0) {
        setError('Connection to database failed. Please check if the server is running.');
      } else if (err.status === 403) {
        setError('You do not have permission to update this review.');
      } else {
        setError(err.message || 'Failed to update review');
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
        <Label htmlFor="edit-title">Review Title</Label>
        <Input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Enter a title for your review"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-rating" className="flex justify-between">
          <span>Rating</span>
          <span className="text-sm text-gray-500">{rating.toFixed(1)}/10</span>
        </Label>
        <div className="flex items-center gap-4">
          <input
            id="edit-rating"
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={rating}
            onChange={(e) => setRating(parseFloat(e.target.value))}
            className="flex-1"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="edit-description">Review Content</Label>
        <Textarea
          id="edit-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={5}
          placeholder="Write your review here..."
          className="min-h-[120px]"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving Changes...' : 'Update Review'}
      </Button>
    </form>
  );
}
