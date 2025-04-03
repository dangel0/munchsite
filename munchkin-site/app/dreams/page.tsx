'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { pb } from '@/lib/pocketbase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DreamCard } from '@/components/dreams/DreamCard';
import { NewDreamForm } from '@/components/dreams/NewDreamForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus } from 'lucide-react';

export default function DreamsPage() {
  const [dreams, setDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  // Check if the server is available
  const checkServerStatus = async () => {
    try {
      // Try to make a simple request to PocketBase's health endpoint or collections endpoint
      const response = await fetch('http://127.0.0.1:8090/api/health', { method: 'GET' });
      if (response.ok) {
        setServerStatus('online');
        return true;
      } else {
        setServerStatus('offline');
        return false;
      }
    } catch (error) {
      console.error('Server status check failed:', error);
      setServerStatus('offline');
      return false;
    }
  };

  useEffect(() => {
    async function initializeAndFetchData() {
      const isServerOnline = await checkServerStatus();
      if (!isServerOnline) {
        setError('Cannot connect to the database server. Please make sure PocketBase is running.');
        setLoading(false);
        return;
      }

      fetchDreams();
    }

    if (user) {
      initializeAndFetchData();
    }
  }, [user, retryCount]);

  async function fetchDreams() {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const records = await pb.collection('dreams').getFullList({
        sort: '-created',
        expand: 'user',
      });
      
      setDreams(records);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dreams:', err);
      
      // Provide more specific error messages based on the error
      if (err.status === 0) {
        setError('Connection to database failed. Please check if the PocketBase server is running.');
      } else if (err.status === 403) {
        setError('You do not have permission to view these dreams.');
      } else {
        setError(err.message || 'Failed to fetch dreams');
      }
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleNewDream = (newDream: any) => {
    setDreams((prevDreams) => [newDream, ...prevDreams]);
    setFormOpen(false); // Close the dialog after submitting
  };
  
  const name = user?.name || user?.email || 'Anonymous';

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dreams {name}</h1>
          
          {serverStatus !== 'offline' && (
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogTitle>Add New Dream</DialogTitle>
                <NewDreamForm onDreamAdded={handleNewDream} />
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {serverStatus === 'offline' ? (
          <div className="mb-8 p-6 bg-red-50 rounded-lg text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
              <h2 className="text-xl font-semibold text-red-700">Database Connection Error</h2>
            </div>
            <p className="mb-4">
              Cannot connect to the PocketBase database. Please make sure the PocketBase server is running at http://127.0.0.1:8090.
            </p>
            <Button onClick={handleRetry}>Retry Connection</Button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Your Dreams</h2>
              
              {loading ? (
                <p className="text-center py-8">Loading dreams...</p>
              ) : error ? (
                <div className="text-center py-8 bg-red-50 text-red-600 rounded-lg">
                  <p>{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleRetry}
                  >
                    Retry
                  </Button>
                </div>
              ) : dreams.length === 0 ? (
                <p className="text-center py-8 bg-gray-50 rounded-lg">No dreams yet. Add your first dream above!</p>
              ) : (
                dreams.map((dream) => (
                  <DreamCard key={dream.id} dream={dream} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
