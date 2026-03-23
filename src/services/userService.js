// Frontend service to call backend API for user deletion
import { auth } from "../lib/firebase";

export const deleteUserFromSystem = async (uid) => {
  try {
    const response = await fetch('http://localhost:3001/api/users/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await auth.currentUser?.getIdToken()}`
      },
      body: JSON.stringify({ uid })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};