// Frontend-only user service using Firebase client SDK
import { auth, db } from "../lib/firebase";
import { deleteUser } from "firebase/auth";
import { ref, remove, set } from "firebase/database";

// Note: Deleting other users requires admin privileges
// This function can only delete the currently authenticated user
export const deleteCurrentUser = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }

    // Delete user data from database first
    const userRef = ref(db, `users/${user.uid}`);
    await remove(userRef);

    // Delete the user account (only works for current user)
    await deleteUser(user);

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Alternative: Disable user instead of deleting (recommended approach)
export const disableUser = async (uid, userData = {}) => {
  try {
    const userRef = ref(db, `users/${uid}`);
    await set(userRef, {
      ...userData,
      disabled: true,
      disabledAt: Date.now()
    });
    
    return { success: true, message: 'User disabled successfully' };
  } catch (error) {
    console.error('Error disabling user:', error);
    throw error;
  }
};