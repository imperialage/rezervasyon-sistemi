import { db, auth } from '../firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { Administrator } from '../types';

export const createAdministrator = async (
  email: string,
  fullName: string,
  role: 'superadmin' | 'admin' = 'admin',
  permissions: string[] = ['read:reservations', 'write:reservations']
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı');

    // Administrators koleksiyonunu oluştur (eğer yoksa)
    const adminCollectionRef = collection(db, 'administrators');
    const adminDocs = await getDocs(adminCollectionRef);
    
    // İlk admin ise superadmin yap
    if (adminDocs.empty) {
      role = 'superadmin';
      permissions = ['read:reservations', 'write:reservations', 'manage:users', 'manage:admins'];
    }

    const adminData: Omit<Administrator, 'uid'> = {
      email,
      fullName,
      role,
      permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Yönetici belgesini oluştur
    await setDoc(doc(db, 'administrators', user.uid), {
      uid: user.uid,
      ...adminData
    });

    console.log(`Yönetici başarıyla oluşturuldu: ${role}`);
  } catch (error) {
    console.error('Yönetici oluşturma hatası:', error);
    throw error;
  }
};