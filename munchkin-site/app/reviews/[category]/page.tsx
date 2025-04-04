'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Plus, Star, Edit, Trash, ThumbsUp } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { AddReviewForm } from '@/components/reviews/AddReviewForm';
import { EditReviewForm } from '@/components/reviews/EditReviewForm';

export default function CategoryReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const category = decodeURIComponent(params.category as string);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Handle review update
  const handleReviewUpdated = (updatedReview: any) => {
    setReviews(prevReviews => 
      prevReviews.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      )
    );
    setIsEditDialogOpen(false);
    setCurrentReview(null);
  };

  // Handle review delete
  const handleDeleteReview = async () => {
    if (!currentReview) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      await pb.collection('reviews').delete(currentReview.id);
      setReviews(prevReviews => prevReviews.filter(review => review.id !== currentReview.id));
      setIsDeleteDialogOpen(false);
      setCurrentReview(null);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      setError(err.message || 'Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (review: any) => {
    setCurrentReview(review);
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (review: any) => {
    setCurrentReview(review);
    setIsDeleteDialogOpen(true);
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

  // Check if current user is the author of a review
  const isAuthor = (review: any) => {
    return true;
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 animate-fadeIn">
        <div className="flex items-center mb-2">
          <Link href="/reviews">
            <Button variant="ghost" size="sm" animation="pop" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Categories
            </Button>
          </Link>
        </div>
        
        <div className="flex justify-end items-center mb-6">
          <div className="mr-auto space-y-1">
            <h1 className="text-2xl font-bold gradient-text from-amber-500 to-yellow-600 flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2 text-amber-500" />
              {category} Reviews
            </h1>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                  <span className="font-semibold text-amber-800 dark:text-amber-300">{averageRating}</span>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button variant="gradient" animation="pop" className="from-amber-500 to-yellow-600" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Review
            </Button>
            <DialogContent className="border-t-4 border-amber-500">
              <DialogTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-amber-500 fill-amber-200" />
                <span className="gradient-text from-amber-500 to-yellow-600">Add New Review for {category}</span>
              </DialogTitle>
              <AddReviewForm 
                category={category} 
                onReviewAdded={handleReviewAdded} 
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center animate-fadeIn">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-amber-600 dark:text-amber-400">Loading reviews...</p>
            </div>
          </div>
        ) : (
          /* Reviews list */
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reviews found for this category.</p>
                <Button variant="outline" animation="pop" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Your First Review
                </Button>
              </div>
            ) : (
              reviews.map(review => (
                <Card key={review.id} className="border-t-4 border-amber-400 dark:border-amber-600 hover:shadow-md transition-all duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl text-gray-800 dark:text-gray-100">{review.title}</CardTitle>
                      <div className="flex items-center">
                        <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full mr-2">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                          <span className="font-medium text-amber-800 dark:text-amber-300">{parseFloat(review.rating || 0).toFixed(1)}/10</span>
                        </div>
                        {isAuthor(review) && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(review)}
                              title="Edit review"
                              animation="pop"
                              className="hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(review)}
                              title="Delete review"
                              animation="pop"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardDescription className="flex items-center text-gray-600 dark:text-gray-400">
                      <span className="mr-1">By {review.user || 'Anonymous'}</span>
                      <span className="text-gray-400 mx-1">•</span>
                      <span>{formatDistanceToNow(new Date(review.created), { addSuffix: true })}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/40 p-4 rounded-md border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                      {review.description}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Edit Review Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="border-t-4 border-amber-500">
            <DialogTitle className="flex items-center">
              <Edit className="h-5 w-5 mr-2 text-amber-500" />
              <span className="gradient-text from-amber-500 to-yellow-600">Edit Review</span>
            </DialogTitle>
            {currentReview && (
              <EditReviewForm
                review={currentReview}
                category={category}
                onReviewUpdated={handleReviewUpdated}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="border-t-4 border-red-500">
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center">
              <Trash className="h-5 w-5 mr-2" />
              Delete Review
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                animation="pop"
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={handleDeleteReview}
                disabled={isDeleting}
                animation="pop"
              >
                {isDeleting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
