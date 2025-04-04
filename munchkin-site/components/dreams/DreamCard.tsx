import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pb } from '@/lib/pocketbase';
import { EditDreamForm } from './EditDreamForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Moon, Edit, Trash } from 'lucide-react';

interface DreamCardProps {
  dream: {
    id: string;
    title: string;
    dream: string;
    created: string;
    user?: string;
  };
  onDreamUpdated: () => void;
  onDreamDeleted: () => void;
}

export function DreamCard({ dream, onDreamUpdated, onDreamDeleted }: DreamCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formattedDate = formatDistanceToNow(new Date(dream.created), {
    addSuffix: true,
  });
  
  const author = dream.user || 'Anonymous';

  // Truncate the dream text for card view
  const truncatedText = dream.dream.length > 150
    ? `${dream.dream.substring(0, 150)}...`
    : dream.dream;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await pb.collection('dreams').delete(dream.id);
      setIsDeleteConfirmOpen(false);
      setIsDialogOpen(false);
      onDreamDeleted();
    } catch (error) {
      console.error('Error deleting dream:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="cursor-pointer m-2 hover:shadow-md transition-all duration-300 transform hover:scale-105 hover:rotate-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t-4 border-indigo-400 dark:border-indigo-600" onClick={() => setIsDialogOpen(true)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">{dream.title}</CardTitle>
            <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 text-xs px-2 py-1 rounded-full">Dream</span>
          </div>
          <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Moon className="h-3 w-3 mr-1 text-indigo-500" />
            Dreamed by {author} • {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{truncatedText}</div>
          {dream.dream.length > 150 && (
            <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-indigo-600 dark:text-indigo-400">
              Read more...
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl border-t-4 border-indigo-500">
          {!isEditing ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Moon className="h-5 w-5 mr-2 text-indigo-500" />
                  <span className="gradient-text primary-gradient">{dream.title}</span>
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-400">
                  Dreamed by {author} • {formattedDate}
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                {dream.dream}
              </div>
              <DialogFooter className="flex flex-row gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(true)} animation="pop" className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="error"
                  animation="pop"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </>
          ) : (
            <EditDreamForm 
              dream={dream} 
              onDreamEdited={() => {
                setIsEditing(false);
                onDreamUpdated();
              }}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="border-t-4 border-red-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 dark:text-red-400">You sure bud?</AlertDialogTitle>
            <AlertDialogDescription>
              Theres no going back after this man.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
