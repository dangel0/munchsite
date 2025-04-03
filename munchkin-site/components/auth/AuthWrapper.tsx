'use client';

import { useAuth } from '@/context/AuthContext';
import { AuthUI } from './AuthUI';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-4">Loading authentication...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 max-w-lg min-h-screen flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-center mb-8">Munchkin Site</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl text-center mb-6">Please log in or sign up to continue</h2>
          <AuthUI />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
