import { db } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';

export const migrateUsersToAdministrators = async () => {
  try {
    // Get all users from both collections
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const adminsSnapshot = await getDocs(collection(db, 'administrators'));

    // Create a batch for atomic operations
    const batch = writeBatch(db);

    // Map to store merged user data
    const mergedUsers = new Map();

    // Process administrators first (they take precedence)
    adminsSnapshot.forEach(adminDoc => {
      const adminData = adminDoc.data();
      mergedUsers.set(adminDoc.id, {
        ...adminData,
        role: adminData.role || 'admin',
        isActive: adminData.isActive ?? true,
        updatedAt: new Date().toISOString(),
        updatedBy: 'system_migration'
      });
    });

    // Process users and merge with existing admin data
    usersSnapshot.forEach(userDoc => {
      const userData = userDoc.data();
      const existingData = mergedUsers.get(userDoc.id);

      if (existingData) {
        // Merge with existing admin data
        mergedUsers.set(userDoc.id, {
          ...existingData,
          ...userData,
          role: existingData.role || userData.role || 'admin',
          updatedAt: new Date().toISOString(),
          updatedBy: 'system_migration'
        });
      } else {
        // New user data
        mergedUsers.set(userDoc.id, {
          ...userData,
          role: userData.role || 'admin',
          isActive: userData.isActive ?? true,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system_migration'
        });
      }
    });

    // Update administrators collection with merged data
    for (const [userId, userData] of mergedUsers) {
      const adminRef = doc(db, 'administrators', userId);
      batch.set(adminRef, userData);
    }

    // Delete all documents in users collection
    usersSnapshot.forEach(userDoc => {
      const userRef = doc(db, 'users', userDoc.id);
      batch.delete(userRef);
    });

    // Commit all changes
    await batch.commit();

    console.log('Migration completed successfully');
    console.log('Total users migrated:', mergedUsers.size);
    
    return {
      success: true,
      migratedCount: mergedUsers.size
    };
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
};