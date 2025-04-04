'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { pb } from '@/lib/pocketbase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Trash, Edit } from 'lucide-react';
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
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="mb-6">
          <Link href="/letters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Letters
            </Button>
          </Link>
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
              <p>Loading letter...</p>
            </div>
          </div>
        ) : letter ? (
          isEditing ? (
            // Edit Form
            <Card>
              <CardHeader>
                <CardTitle>Edit Letter</CardTitle>
              </CardHeader>
              <form onSubmit={handleUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="to">To</Label>
                    <Input
                      id="to"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="from">From (optional)</Label>
                    <Input
                      id="from"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Anonymous"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Letter Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={8}
                      required
                    />
                  </div>
                </CardContent>
                <Separator className="my-4" />
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            // Letter View
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{letter.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <p className="text-gray-500">To: <span className="font-medium text-black dark:text-white">{letter.to}</span></p>
                  <p className="text-gray-500">From: <span className="font-medium text-black dark:text-white">{letter.from || 'Anonymous'}</span></p>
                </div>
                
                <div className="whitespace-pre-wrap text-lg">{letter.content}</div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">
                  {letter.created && format(new Date(letter.created), 'MMMM d, yyyy')}
                </p>
              </CardFooter>
            </Card>
          )
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Letter not found</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Stuff</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this letter? There is a 10% chance you kill your buddy in the process.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
