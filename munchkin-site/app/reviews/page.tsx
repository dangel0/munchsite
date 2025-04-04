'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pb } from '@/lib/pocketbase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Star, ThumbsUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { AddCategoryForm } from '@/components/reviews/AddCategoryForm';

export default function ReviewsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<{[key: string]: {count: number, avgRating: number}}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { user } = useAuth();

  // Fetch unique categories from reviews
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const records = await pb.collection('reviews').getList(1, 500);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(records.items.map(item => item.category))
      ).filter(Boolean);
      
      // Calculate stats for each category
      const stats: {[key: string]: {count: number, avgRating: number}} = {};
      uniqueCategories.forEach(category => {
        const categoryReviews = records.items.filter(item => item.category === category);
        const totalRating = categoryReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        stats[category] = {
          count: categoryReviews.length,
          avgRating: categoryReviews.length > 0 ? totalRating / categoryReviews.length : 0
        };
      });
      
      setCategories(uniqueCategories);
      setCategoryStats(stats);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
      setLoading(false);
    }
  }, []);

  // Handle category and first review added
  const handleCategoryAdded = (categoryName: string, review: any) => {
    fetchCategories(); // Refresh the categories list
    setFormOpen(false);
  };

  // Initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 animate-fadeIn">
        <div className="flex justify-end items-center mb-6">
          <div className="flex items-center mr-auto">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-600 dark:to-yellow-700 p-2 rounded-lg mr-3 shadow-md transform transition-all duration-300 hover:scale-110">
              <ThumbsUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text from-amber-500 to-yellow-600">Reviews</h1>
          </div>
          
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" animation="pop" className="from-amber-500 to-yellow-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="border-t-4 border-amber-500">
              <DialogTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2 text-amber-500 fill-amber-200" />
                <span className="gradient-text from-amber-500 to-yellow-600">Add New Category with First Review</span>
              </DialogTitle>
              <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
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
              <p className="text-amber-600 dark:text-amber-400">Loading categories...</p>
            </div>
          </div>
        ) : (
          /* Categories grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
                <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No categories found. Add your first category!</p>
                <Button variant="outline" animation="pop" className="mt-4" onClick={() => setFormOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Category
                </Button>
              </div>
            ) : (
              categories.map(category => (
                <Link href={`/reviews/${encodeURIComponent(category)}`} key={category}>
                  <Card className="cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1 border-t-4 border-amber-400 dark:border-amber-600">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-gray-800 dark:text-gray-100">{category}</CardTitle>
                        {categoryStats[category] && categoryStats[category].count > 0 && (
                          <div className="flex items-center bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded-full text-amber-800 dark:text-amber-300">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                            <span className="font-medium">{categoryStats[category].avgRating.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Click to view reviews
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Browse ratings and opinions for {category}
                      </p>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {categoryStats[category]?.count || 0} {categoryStats[category]?.count === 1 ? 'review' : 'reviews'}
                      </div>
                      <span className="text-xs text-amber-600 dark:text-amber-400">View Details →</span>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
