import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db, isOnline } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { User } from '../types';

interface AuthContextType {
  currentUser: (FirebaseUser & Partial<User>) | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  loading: boolean;
  isOnline: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<(FirebaseUser & Partial<User>) | null>(null);
  const [loading, setLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState(isOnline);

  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(true);
      toast.success('İnternet bağlantısı kuruldu');
    };

    const handleOffline = () => {
      setNetworkStatus(false);
      toast.error('İnternet bağlantısı kesildi. Çevrimdışı modda çalışılıyor.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const adminDoc = await getDoc(doc(db, 'administrators', user.uid));
          if (adminDoc.exists()) {
            const userData = adminDoc.data() as Partial<User>;
            setCurrentUser({ ...user, ...userData });
          } else {
            // Kullanıcı administrators koleksiyonunda yoksa
            setCurrentUser(null);
            await signOut(auth);
            toast.error('Yetkiniz bulunmuyor');
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('User data fetch error:', error);
        // If offline, still set the basic user info
        if (!networkStatus && user) {
          setCurrentUser(user);
          toast.warning('Çevrimdışı modda sınırlı bilgiler görüntüleniyor');
        } else {
          setCurrentUser(null);
        }
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [networkStatus]);

  const login = async (email: string, password: string) => {
    if (!networkStatus) {
      toast.error('Giriş yapmak için internet bağlantısı gerekiyor');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        throw error;
      }
    }
  };

  const register = async (email: string, password: string): Promise<UserCredential> => {
    if (!networkStatus) {
      toast.error('Kayıt olmak için internet bağlantısı gerekiyor');
      throw new Error('No internet connection');
    }
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
      }
      throw error;
    }
  };

  const logout = async () => {
    if (!networkStatus) {
      toast.error('Çıkış yapmak için internet bağlantısı gerekiyor');
      return;
    }
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      if (error.code === 'auth/network-request-failed') {
        toast.error('Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.');
      }
      throw error;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
    isOnline: networkStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};