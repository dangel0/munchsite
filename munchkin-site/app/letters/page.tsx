'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pb } from '@/lib/pocketbase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { NewLetterForm } from '@/components/letters/NewLetterForm';

export default function LettersPage() {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const { user } = useAuth();

  // Fetch letters from the server
  const fetchLetters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const records = await pb.collection('letters').getList(1, 50, {
        sort: '-created',
      });
      
      setLetters(records.items);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching letters:', err);
      setError(err.message || 'Failed to load letters');
      setLoading(false);
    }
  }, []);

  // Handle letter added event
  const handleLetterAdded = (newLetter: any) => {
    setLetters(prevLetters => [newLetter, ...prevLetters]);
    setFormOpen(false);
  };

  // Initial load
  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Letters</h1>
          
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Write a Letter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Write a New Letter</DialogTitle>
              <NewLetterForm onLetterAdded={handleLetterAdded} />
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
              <p>Loading letters...</p>
            </div>
          </div>
        ) : (
          /* Letters grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {letters.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No letters found. Write your first letter!</p>
              </div>
            ) : (
              letters.map(letter => (
                <Link href={`/letters/${letter.id}`} key={letter.id}>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{letter.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <div className="text-sm font-medium">To: {letter.to}</div>
                        <div className="text-sm mb-2">From: {letter.from || 'Anonymous'}</div>
                        <p className="text-gray-500 dark:text-gray-300 line-clamp-3">{letter.content}</p>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(letter.created), { addSuffix: true })}
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
