import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { pb } from '@/lib/pocketbase';
import { EditDreamForm } from './EditDreamForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
      <Card className="cursor-pointer m-2 hover:shadow-md transition-shadow" onClick={() => setIsDialogOpen(true)}>
        <CardHeader>
          <CardTitle>{dream.title}</CardTitle>
          <CardDescription>
            Dreamed by {author} • {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap">{truncatedText}</div>
          {dream.dream.length > 150 && (
            <Button variant="link" size="sm" className="p-0 h-auto mt-2">
              Read more...
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          {!isEditing ? (
            <>
              <DialogHeader>
                <DialogTitle>{dream.title}</DialogTitle>
                <DialogDescription>
                  Dreamed by {author} • {formattedDate}
                </DialogDescription>
              </DialogHeader>
              <div className="my-4 whitespace-pre-wrap">
                {dream.dream}
              </div>
              <DialogFooter className="flex flex-row gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>You sure bud?</AlertDialogTitle>
            <AlertDialogDescription>
              Theres no going back after this man.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
