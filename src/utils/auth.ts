import { auth, db } from '../firebase';
import { updatePassword } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export const updateUserPassword = async (userId: string, newPassword: string) => {
  try {
    // Get the user document from administrators collection
    const adminRef = doc(db, 'administrators', userId);
    const adminDoc = await getDoc(adminRef);

    if (!adminDoc.exists()) {
      throw new Error('User not found in administrators collection');
    }

    // Update password in Firestore administrators collection
    await updateDoc(adminRef, {
      password: newPassword, // Firebase Auth handles password security
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'system'
    });

    // Update password in Firebase Auth if it's the current user
    const userAuth = auth.currentUser;
    if (userAuth && userAuth.uid === userId) {
      await updatePassword(userAuth, newPassword);
    }

    return true;
  } catch (error) {
    console.error('Password update error:', error);
    throw error;
  }
};