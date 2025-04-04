'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Trash, Edit, Mail, Send } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function LetterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const letterId = params.id as string;
  
  const [letter, setLetter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [to, setTo] = useState('');
  const [from, setFrom] = useState('');
  const [content, setContent] = useState('');
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchLetter = async () => {
      if (!letterId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const record = await pb.collection('letters').getOne(letterId);
        setLetter(record);
        
        // Set form initial values
        setTitle(record.title);
        setTo(record.to);
        setFrom(record.from || '');
        setContent(record.content);
        
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching letter:', err);
        setError(err.message || 'Failed to load letter');
        setLoading(false);
      }
    };
    
    fetchLetter();
  }, [letterId]);

  // Handle edit form submission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = {
        title: title.trim(),
        to: to.trim(),
        from: from.trim() || 'Anonymous',
        content: content.trim(),
      };

      const updated = await pb.collection('letters').update(letterId, data);
      setLetter(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating letter:', err);
      setError(err.message || 'Failed to update letter');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle letter deletion
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      await pb.collection('letters').delete(letterId);
      setDeleteDialogOpen(false);
      router.push('/letters');
    } catch (err: any) {
      console.error('Error deleting letter:', err);
      setError(err.message || 'Failed to delete letter');
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 max-w-3xl animate-fadeIn">
        <div className="mb-6">
          <Link href="/letters">
            <Button variant="ghost" size="sm" animation="pop" className="group">
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Letters
            </Button>
          </Link>
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
              <p className="text-purple-600 dark:text-purple-400">Loading letter...</p>
            </div>
          </div>
        ) : letter ? (
          isEditing ? (
            // Edit Form
            <Card className="border-t-4 border-purple-500 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Letter
                </CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-700 dark:text-gray-300">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="to" className="text-gray-700 dark:text-gray-300">To</Label>
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      required
                      className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="from" className="text-gray-700 dark:text-gray-300">From (optional)</Label>
                    <Input
                      id="from"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Anonymous"
                      className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content" className="text-gray-700 dark:text-gray-300">Letter Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      required
                      className="focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 min-h-[200px]"
                    />
                  </div>
                </CardContent>
                <Separator className="my-4 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                    animation="pop"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    variant="gradient"
                    animation="pop"
                    className="bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            // Letter View
            <Card className="border-t-4 border-purple-500 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold gradient-text primary-gradient">{letter.title}</CardTitle>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {letter.created && format(new Date(letter.created), 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsEditing(true)}
                    animation="pop"
                    className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <Edit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    onClick={() => setDeleteDialogOpen(true)}
                    animation="pop"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-1 border-l-4 border-purple-200 dark:border-purple-800 pl-4 py-2">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-500 dark:text-gray-400 w-16">To:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{letter.to}</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-500 dark:text-gray-400 w-16">From:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{letter.from || 'Anonymous'}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-md p-5 whitespace-pre-wrap text-lg leading-relaxed border border-gray-100 dark:border-gray-700 relative shadow-inner">
                  <span className="absolute -top-3 left-5 bg-white dark:bg-gray-800 px-2 text-xs text-gray-500 dark:text-gray-400">LETTER CONTENT</span>
                  {letter.content}
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-200 dark:border-gray-700">
            <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Letter not found</p>
            <Button variant="outline" animation="pop" className="mt-4" asChild>
              <Link href="/letters">
                <ArrowLeft className="h-4 w-4 mr-2" /> 
                Back to all letters
              </Link>
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="border-t-4 border-red-500">
            <DialogHeader>
              <DialogTitle className="text-red-600 dark:text-red-400 flex items-center">
                <Trash className="h-5 w-5 mr-2" />
                Delete Letter
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this letter? There is a 10% chance you kill your buddy in the process.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
                animation="pop"
              >
                Cancel
              </Button>
              <Button 
                variant="error"
                onClick={handleDelete}
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
