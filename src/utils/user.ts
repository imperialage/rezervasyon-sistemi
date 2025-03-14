import { db, auth } from '../firebase';
import { doc, setDoc, collection, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { User, UserRole } from '../types';

export const createUser = async (
  email: string,
  name: string,
  role: UserRole = 'reader'
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Kullanıcı oturumu bulunamadı');
    }

    // Users koleksiyonunu oluştur (eğer yoksa)
    const usersCollectionRef = collection(db, 'users');
    const userDocs = await getDocs(usersCollectionRef);
    
    // İlk kullanıcı ise superadmin yap
    if (userDocs.empty) {
      role = 'superadmin';
    }

    const userData: User = {
      id: user.uid,
      email,
      name,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.email
    };

    // Kullanıcı belgesini oluştur
    await setDoc(doc(db, 'users', user.uid), userData);
    console.log(`Kullanıcı başarıyla oluşturuldu: ${role}`);
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  updates: Partial<User>,
  currentUserRole: UserRole
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const userData = userDoc.data() as User;

    // Role update validation
    if (updates.role && !canUpdateRole(currentUserRole, userData.role, updates.role)) {
      throw new Error('Bu kullanıcının rolünü değiştirme yetkiniz yok');
    }

    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email
    };

    await updateDoc(userRef, updatedData);
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    throw error;
  }
};

// Role hierarchy for permission checks
const ROLE_HIERARCHY: { [key in UserRole]: number } = {
  'superadmin': 4,
  'admin': 3,
  'editor': 2,
  'reader': 1
};

export const canUpdateRole = (
  currentUserRole: UserRole,
  targetUserCurrentRole: UserRole,
  targetUserNewRole: UserRole
): boolean => {
  const currentUserLevel = ROLE_HIERARCHY[currentUserRole];
  const targetCurrentLevel = ROLE_HIERARCHY[targetUserCurrentRole];
  const targetNewLevel = ROLE_HIERARCHY[targetUserNewRole];

  // Superadmin can update any role
  if (currentUserRole === 'superadmin') return true;

  // Admin can only update roles below them
  if (currentUserRole === 'admin') {
    return targetCurrentLevel < ROLE_HIERARCHY['admin'] && 
           targetNewLevel < ROLE_HIERARCHY['admin'];
  }

  // Others cannot update roles
  return false;
};