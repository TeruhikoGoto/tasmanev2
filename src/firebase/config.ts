import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 開発環境でEmulatorに接続
if (import.meta.env.DEV && !import.meta.env.VITE_USE_PRODUCTION_FIREBASE) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('🔐 Auth Emulatorに接続しました');
  } catch (error) {
    console.log('Auth Emulatorは既に接続済みです');
  }
  
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('🔥 Firestore Emulatorに接続しました');
  } catch (error) {
    console.log('Firestore Emulatorは既に接続済みです');
  }
}

export default app;