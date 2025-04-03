import PocketBase from 'pocketbase';

// Connect to the running PocketBase instance
export const pb = new PocketBase('http://127.0.0.1:8090');

// Helper to check if a user is authenticated
export const isLoggedIn = () => {
  return pb.authStore.isValid;
};

// Get the current user data
export const getCurrentUser = () => {
  return pb.authStore.model;
};
