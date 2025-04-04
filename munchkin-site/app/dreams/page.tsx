'use client';

import { useState, useEffect, useCallback } from 'react';
import { pb } from '@/lib/pocketbase';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { DreamCard } from '@/components/dreams/DreamCard';
import { NewDreamForm } from '@/components/dreams/NewDreamForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Moon, Stars } from 'lucide-react';

export default function DreamsPage() {
  const [dreams, setDreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  // Check if the server is available - wrapped in useCallback
  const checkServerStatus = useCallback(async () => {
    try {
      const isOnline = await pb.collection('dreams').getList(1, 1, {
        sort: '-created',
        filter: 'id != ""',
      }).then(() => true).catch(() => false);
      
      setServerStatus(isOnline ? 'online' : 'offline');
      return isOnline;
    } catch (error) {
      setServerStatus('offline');
      return false;
    }
  }, []);

  // Fetch dreams from the server - wrapped in useCallback
  const fetchDreams = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check server status first
      const isOnline = await checkServerStatus();
      
      if (!isOnline) {
        setError('Could not connect to the database server. Please try again later.');
        setLoading(false);
        return;
      }
      
      const records = await pb.collection('dreams').getList(1, 50, {
        sort: '-created',
      });
      
      setDreams(records.items);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching dreams:', err);
      setError(err.message || 'Failed to load dreams');
      setLoading(false);
    }
  }, [checkServerStatus]);

  // Handle dream added event
  const handleDreamAdded = (newDream: any) => {
    setDreams(prevDreams => [newDream, ...prevDreams]);
    setFormOpen(false);
  };

  // Handle dream updates
  const handleDreamUpdated = useCallback(() => {
    fetchDreams();
  }, [fetchDreams]);
  
  // Handle dream deletions  
  const handleDreamDeleted = useCallback(() => {
    fetchDreams();
  }, [fetchDreams]);

  // Retry connection when offline
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setServerStatus('checking');
    fetchDreams();
  };

  // Initial load and retry mechanism
  // Trigger the fetch on component mount and when retryCount changes
  useEffect(() => {
    fetchDreams();
  }, [fetchDreams, retryCount]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 rounded-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg mr-3 shadow-md transform transition-all duration-300 hover:scale-110">
              <Moon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text primary-gradient">Dreams Journal</h1>
          </div>
          
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient btn-pop">
                <Plus className="mr-2 h-4 w-4" />
                New Dream
              </Button>
            </DialogTrigger>
            <DialogContent className="border-t-4 border-indigo-500">
              <DialogTitle className="flex items-center">
                <Stars className="h-5 w-5 mr-2 text-indigo-500" />
                <span className="gradient-text primary-gradient">Record a New Dream</span>
              </DialogTitle>
              <NewDreamForm onDreamAdded={handleDreamAdded} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center animate-fadeIn">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
            {serverStatus === 'offline' && (
              <Button variant="outline" size="sm" onClick={handleRetry} className="ml-auto hover:bg-red-100 transition-colors">
                Retry Connection
              </Button>
            )}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-indigo-600 dark:text-indigo-400">Loading dreams...</p>
            </div>
          </div>
        ) : (
          /* Dreams grid - enhanced with a starry background */
          <div className="rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("https://images.unsplash.com/photo-1516060610219-308fc12a5e37?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', 
              backgroundRepeat: 'repeat',
              borderRadius: '12px',
              boxShadow: '0 4px 20px -5px rgba(0,0,0,0.2)'
            }}>
            {dreams.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-gray-50/90 dark:bg-gray-800/90 rounded-lg backdrop-blur-sm">
                <p className="text-gray-500 dark:text-gray-400">No dreams found. Create your first dream!</p>
              </div>
            ) : (
              dreams.map(dream => (
                <DreamCard 
                  key={dream.id} 
                  dream={dream} 
                  onDreamUpdated={handleDreamUpdated}
                  onDreamDeleted={handleDreamDeleted}
                />
              ))
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
