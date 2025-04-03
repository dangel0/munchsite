'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function AuthUI() {
  const { user, logout, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="text-center p-4">Loading authentication...</div>;
  }
  
  if (user) {
    return (
      <div className="p-4 border rounded-lg max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h2>
        <p className="mb-4">You are logged in with: {user.email}</p>
        <Button onClick={logout}>Logout</Button>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="login" className="max-w-md mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
      <TabsContent value="register">
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
}
