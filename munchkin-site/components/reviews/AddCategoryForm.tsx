'use client';

import { useState } from 'react';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface AddCategoryFormProps {
  onCategoryAdded: (category: string, review: any) => void;
}

export function AddCategoryForm({ onCategoryAdded }: AddCategoryFormProps) {
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState<number>(7); // Default rating
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Create a new review with the category
      const newReview = await pb.collection('reviews').create({
        category,
        title,
        description,
        rating,
        user: user.name
      });

      // Reset form
      setCategory('');
      setTitle('');
      setDescription('');
      setRating(7);
      
      // Call the callback function
      onCategoryAdded(category, newReview);
    } catch (err: any) {
      console.error('Error adding category and review:', err);
      setError(err.message || 'Failed to create category and review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="category" className="text-gray-800 dark:text-gray-200 flex items-center">
          <span className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded-md mr-2">
            <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </span>
          Category Name
        </Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          placeholder="e.g., Movies, Restaurants, Books"
          className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
        />
      </div>

      <Separator className="my-4 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
      
      <div className="py-2">
        <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">First Review in This Category</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Review Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter title for your first review"
              className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rating" className="flex justify-between text-gray-700 dark:text-gray-300">
              <span>Rating</span>
              <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">{rating.toFixed(1)}/10</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">0</span>
              <input
                id="rating"
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
                className="flex-1 accent-amber-500"
              />
              <span className="text-xs text-gray-500">10</span>
            </div>
            <div className="flex justify-center mt-1">
              <div className="flex gap-1">
                {[...Array(Math.floor(rating / 2))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-amber-500 fill-amber-500" />
                ))}
                {rating % 2 !== 0 && <Star className="h-4 w-4 text-amber-500 fill-amber-500 opacity-50" />}
                {[...Array(5 - Math.ceil(rating / 2))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-gray-300 dark:text-gray-700" />
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">Review Content</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Write your review here..."
              rows={5}
              className="min-h-[120px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
        variant="gradient"
        animation="pop"
        className="from-amber-500 to-yellow-600"
      >
        {isSubmitting ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating...
          </span>
        ) : "Create Category & Review"}
      </Button>
    </form>
  );
}
