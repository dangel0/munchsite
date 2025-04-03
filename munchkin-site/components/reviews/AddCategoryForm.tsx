'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AddCategoryFormProps {
  onCategoryAdded: (category: string, review: any) => void;
}

export function AddCategoryForm({ onCategoryAdded }: AddCategoryFormProps) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(7); // Default rating of 7/10
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category.trim() || !title.trim() || !description.trim()) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a real review entry to establish the category
      const newReview = await pb.collection('reviews').create({
        category: category.trim(),
        title: title.trim(),
        description: description.trim(),
        rating,
        user: user.name
      });

      // Reset form
      setCategory('');
      setTitle('');
      setDescription('');
      setRating(7);
      
      // Call the callback function to update the parent component
      onCategoryAdded(category.trim(), newReview);
    } catch (err: any) {
      console.error('Error adding category and review:', err);
      
      if (err.status === 0) {
        setError('Connection to database failed. Please check if the PocketBase server is running.');
      } else if (err.status === 403) {
        setError('You do not have permission to add reviews.');
      } else {
        setError(err.message || 'Failed to add category and review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-sm">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="category" className="font-medium text-base">Category Name</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          placeholder="Enter a new category name"
        />
      </div>
      
      <div className="pt-4 border-t mt-4">
        <h3 className="text-sm text-gray-600 mb-4">Add your first review for this category</h3>
      
        <div className="space-y-2">
          <Label htmlFor="title">Review Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter a title for your review"
          />
        </div>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="rating" className="flex justify-between">
            <span>Rating</span>
            <span className="text-sm text-gray-500">{rating.toFixed(1)}/10</span>
          </Label>
          <div className="flex items-center gap-4">
            <input
              id="rating"
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
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="description">Review Content</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            placeholder="Write your review here..."
            className="min-h-[120px]"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-4" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Adding Category & Review...' : 'Add Category & Review'}
      </Button>
    </form>
  );
}
