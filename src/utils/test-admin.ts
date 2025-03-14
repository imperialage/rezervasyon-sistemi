import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { createAdministrator } from './admin';
import { Administrator } from '../types';

export const createTestAdmin = async () => {
  try {
    // Test yöneticisi oluştur
    await createAdministrator(
      'test@admin.com',
      'Test Admin',
      'admin',
      ['read:reservations', 'write:reservations', 'manage:users']
    );
    
    console.log('Test yöneticisi başarıyla oluşturuldu');
    
    // Oluşturulan yöneticiyi kontrol et
    const adminsRef = collection(db, 'administrators');
    const q = query(adminsRef, where('email', '==', 'test@admin.com'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const adminData = querySnapshot.docs[0].data() as Administrator;
      console.log('Oluşturulan yönetici bilgileri:', adminData);
      return adminData;
    }
    
    throw new Error('Yönetici bulunamadı');
  } catch (error) {
    console.error('Test yöneticisi oluşturma hatası:', error);
    throw error;
  }
};

export const listAllAdmins = async (): Promise<Administrator[]> => {
  if (!db) {
    console.error('Firebase bağlantısı başlatılmamış');
    return [];
  }

  try {
    const adminsRef = collection(db, 'administrators');
    const querySnapshot = await getDocs(adminsRef);
    
    if (querySnapshot.empty) {
      console.log('Henüz hiç yönetici bulunmuyor');
      return [];
    }

    const admins = querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    })) as Administrator[];
    
    return admins;
  } catch (error) {
    console.error('Yöneticileri listelerken hata:', error);
    return [];
  }
};