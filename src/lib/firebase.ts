import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  initializeAuth, 
  browserLocalPersistence, 
  indexedDBLocalPersistence, 
  browserSessionPersistence, 
  Auth 
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { FIREBASE_CONFIG } from './constants';

let app: FirebaseApp | undefined = undefined;
let auth: Auth | undefined = undefined;
let db: Firestore | undefined = undefined;

// Csak akkor inicializálunk, ha van megadott API kulcs (build-időben üres kulcs esetén nem dob hibát)
if (typeof window !== 'undefined' || FIREBASE_CONFIG.apiKey) {
  try {
    const isNew = !getApps().length;
    app = isNew ? initializeApp(FIREBASE_CONFIG) : getApp();

    if (typeof window !== 'undefined') {
      try {
        // initializeAuth popup resolver nélkül: elkerüli a felesleges iframe betöltést az authDomain-ről
        auth = initializeAuth(app, {
          persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
        });
      } catch {
        auth = getAuth(app);
      }
    } else {
      auth = getAuth(app);
    }

    db = getFirestore(app);
  } catch (e) {
    console.warn('Firebase inicializálási figyelmeztetés:', e);
  }
}

export { app, auth, db };
export default app;
