'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Plus, Star } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { AddReviewForm } from '@/components/reviews/AddReviewForm';

export default function CategoryReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  // Fetch reviews for this category
  const fetchReviews = useCallback(async () => {
    if (!category) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const records = await pb.collection('reviews').getList(1, 50, {
        sort: '-created',
        filter: `category = "${category}"`
      });
      
      setReviews(records.items);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
      setLoading(false);
    }
  }, [category]);

  // Handle new review added
  const handleReviewAdded = (newReview: any) => {
    setReviews(prevReviews => [newReview, ...prevReviews]);
    setIsDialogOpen(false);
  };

  // Calculate average rating for the category
  const averageRating = reviews.length 
    ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1) 
    : '0.0';

  // Initial load
  useEffect(() => {
    if (category) {
      fetchReviews();
    }
  }, [category, fetchReviews]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-2">
          <Link href="/reviews">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
        
        <div className="flex justify-end items-center mb-6">
          <div className="mr-auto">
            <h1 className="text-2xl font-bold">{category} Reviews</h1>
            {reviews.length > 0 && (
              <div className="flex items-center mt-1">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-semibold">{averageRating}</span>
                </div>
                <span className="text-gray-500 text-sm ml-2">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Button>
            <DialogContent>
              <DialogTitle>Add New Review for {category}</DialogTitle>
              <AddReviewForm 
                category={category} 
                onReviewAdded={handleReviewAdded} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading reviews...</p>
            </div>
          </div>
        ) : (
          /* Reviews list */
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No reviews found for this category. Add your first review!</p>
              </div>
            ) : (
              reviews.map(review => (
                <Card key={review.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{review.title}</CardTitle>
                      <div className="flex items-center px-2 py-1 rounded">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">{parseFloat(review.rating || 0).toFixed(1)}/10</span>
                      </div>
                    </div>
                    <CardDescription>
                      By {review.user || 'Anonymous'} • {
                        formatDistanceToNow(new Date(review.created), { addSuffix: true })
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{review.description}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
