import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  connectAuthEmulator,
  initializeAuth,
  indexedDBLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED,
  enableMultiTabIndexedDbPersistence,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  disableNetwork,
  enableNetwork
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { offlineStore } from './utils/offline-store';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with improved persistence and offline support
const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});

// Initialize Firestore with optimized settings for offline support
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
  })
});

// Network status monitoring
let isOnline = navigator.onLine;
let retryCount = 0;
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;

// Initialize offline store
offlineStore.init().catch(console.error);

// Enhanced retry operation with exponential backoff
const retryOperation = async (operation: () => Promise<any>) => {
  let lastError;
  let delay = INITIAL_RETRY_DELAY;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      if (error.code === 'auth/network-request-failed' || 
          error.code === 'unavailable' || 
          error.name === 'FirebaseError') {
        
        const jitter = Math.random() * 0.3 + 0.85;
        delay = Math.min(delay * 2 * jitter, MAX_RETRY_DELAY);
        
        console.warn(`Retry attempt ${i + 1} after ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
};

// Network status monitoring with debounce
let networkTimeout: NodeJS.Timeout;
const NETWORK_DEBOUNCE = 2000;

const handleNetworkChange = async (online: boolean) => {
  clearTimeout(networkTimeout);
  networkTimeout = setTimeout(async () => {
    if (isOnline !== online) {
      isOnline = online;
      try {
        if (online) {
          await enableNetwork(db);
          retryCount = 0;
          
          // Process pending operations
          const pendingOps = await offlineStore.getPendingOperations();
          for (const op of pendingOps) {
            try {
              // Process operation based on type
              // Implementation depends on your specific needs
              await offlineStore.clearPendingOperation(op.id);
            } catch (error) {
              console.error('Failed to process pending operation:', error);
            }
          }

          toast.success('İnternet bağlantısı kuruldu', {
            duration: 3000,
            position: 'top-right',
            icon: '🌐'
          });
        } else {
          await disableNetwork(db);
          toast.error('İnternet bağlantısı kesildi. Çevrimdışı modda çalışılıyor.', {
            duration: 5000,
            position: 'top-right',
            icon: '⚠️'
          });
        }
      } catch (error) {
        console.error('Network state change error:', error);
      }
    }
  }, NETWORK_DEBOUNCE);
};

// Network event listeners
window.addEventListener('online', () => handleNetworkChange(true));
window.addEventListener('offline', () => handleNetworkChange(false));

// Initial network status check
handleNetworkChange(navigator.onLine);

export { auth, db, isOnline, retryOperation, offlineStore };
export default app;