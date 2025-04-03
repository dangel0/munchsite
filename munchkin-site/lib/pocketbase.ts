import PocketBase from 'pocketbase';

// Connect to the running PocketBase instance
export const pb = new PocketBase('http://127.0.0.1:8090');

// Add timeout to PocketBase requests
pb.autoCancellation(false);

// Helper to check if a user is authenticated
export const isLoggedIn = () => {
  return pb.authStore.isValid;
};

// Get the current user data
export const getCurrentUser = () => {
  return pb.authStore.model;
};

// Check if the PocketBase server is online
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    // Use fetch instead of pb to avoid PocketBase's auto-cancellation
    const response = await fetch(`${pb.baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout to quickly detect if server is down
      signal: AbortSignal.timeout(3000),
    });
    
    return response.ok;
  } catch (error) {
    console.error('PocketBase server check failed:', error);
    return false;
  }
};
