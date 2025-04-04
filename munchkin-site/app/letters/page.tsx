'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pb } from '@/lib/pocketbase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Mail, Send } from 'lucide-react';
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
      <div className="container mx-auto p-4 animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-600 dark:to-purple-700 p-2 rounded-lg mr-3 shadow-md transform transition-all duration-300 hover:scale-110">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text primary-gradient">Letters</h1>
          </div>
          
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" animation="pop" className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Write a Letter
              </Button>
            </DialogTrigger>
            <DialogContent className="border-t-4 border-purple-500">
              <DialogTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2 text-purple-500" />
                <span className="gradient-text primary-gradient">Write a New Letter</span>
              </DialogTitle>
              <NewLetterForm onLetterAdded={handleLetterAdded} />
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
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-purple-600 dark:text-purple-400">Loading letters...</p>
            </div>
          </div>
        ) : (
          /* Letters grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {letters.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No letters found. Write your first letter!</p>
                <Button variant="outline" animation="pop" className="mt-4" onClick={() => setFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Write a Letter
                </Button>
              </div>
            ) : (
              letters.map(letter => (
                <Link href={`/letters/${letter.id}`} key={letter.id}>
                  <Card className="cursor-pointer hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:rotate-1 h-full border-t-4 border-pink-400 dark:border-pink-600">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-2 text-gray-800 dark:text-gray-100">{letter.title}</CardTitle>
                        <span className="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-300 text-xs px-2 py-1 rounded-full">Letter</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <div className="text-sm font-medium flex items-center">
                          <span className="text-gray-500 dark:text-gray-400">To:</span> 
                          <span className="ml-1 text-gray-800 dark:text-gray-200">{letter.to}</span>
                        </div>
                        <div className="text-sm mb-2 flex items-center">
                          <span className="text-gray-500 dark:text-gray-400">From:</span> 
                          <span className="ml-1 text-gray-800 dark:text-gray-200">{letter.from || 'Anonymous'}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-md italic">{letter.content}</p>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t border-gray-100 dark:border-gray-800">
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
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
