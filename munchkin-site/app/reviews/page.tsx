'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pb } from '@/lib/pocketbase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Star } from 'lucide-react';
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
      <div className="container mx-auto p-4">
        <div className="flex justify-end items-center mb-6">
          <h1 className="text-2xl font-bold mr-auto">Reviews</h1>
          
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogTitle>Add New Category with First Review</DialogTitle>
              <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
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
              <p>Loading categories...</p>
            </div>
          </div>
        ) : (
          /* Categories grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No categories found. Add your first category!</p>
              </div>
            ) : (
              categories.map(category => (
                <Link href={`/reviews/${encodeURIComponent(category)}`} key={category}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{category}</CardTitle>
                        {categoryStats[category] && categoryStats[category].count > 0 && (
                          <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="font-medium">{categoryStats[category].avgRating.toFixed(1)}/10</span>
                          </div>
                        )}
                      </div>
                      <CardDescription>
                        Click to view reviews
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">
                        Browse reviews for {category}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <div className="text-sm text-gray-500">
                        {categoryStats[category]?.count || 0} {categoryStats[category]?.count === 1 ? 'review' : 'reviews'}
                      </div>
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
