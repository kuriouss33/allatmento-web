'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  getIdToken
} from 'firebase/auth';
import { getAnonymousUserId } from '@/lib/storage';
import { getMe, registerProfile, sendVerificationEmail } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  idToken: string | null;
  isRescuer: boolean;
  isAdmin: boolean;
  anonymousUid: string;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  profile: null,
  loading: true,
  idToken: null,
  isRescuer: false,
  isAdmin: false,
  anonymousUid: '',
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  resendVerification: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user: FirebaseUser) => {
    try {
      const tokenResult = await user.getIdTokenResult(true);
      const token = tokenResult.token;
      setIdToken(token);

      const claimRole = tokenResult.claims?.role as UserProfile['role'] | undefined;

      try {
        const userProfile = await getMe(token);
        setProfile({
          ...userProfile,
          role: claimRole || userProfile.role || 'public',
        });
      } catch (err) {
        console.warn('Backend profil lekérés figyelmeztetés, token adatok használata:', err);
        setProfile({
          uid: user.uid,
          email: user.email || '',
          role: claimRole || 'public',
          status: claimRole === 'verified_rescuer' || claimRole === 'super_admin' ? 'active' : 'pending_approval'
        });
      }
    } catch (err) {
      console.error('Hiba a felhasználói profil lekérésekor:', err);
      setProfile({
        uid: user.uid,
        email: user.email || '',
        role: 'public',
        status: 'pending_approval'
      });
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setProfile(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error('A bejelentkezési szolgáltatás jelenleg nem elérhető.');
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    await fetchProfile(cred.user);
  };

  const register = async (email: string, pass: string) => {
    if (!auth) throw new Error('A regisztrációs szolgáltatás jelenleg nem elérhető.');
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    try {
      await registerProfile(cred.user.uid, email);
      await sendVerificationEmail(email);
    } catch (err) {
      console.warn('Figyelem a regisztrációs profil rögzítésekor:', err);
    }
    await fetchProfile(cred.user);
  };

  const logout = async () => {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn('Figyelmeztetés kijelentkezéskor:', err);
    } finally {
      setFirebaseUser(null);
      setProfile(null);
      setIdToken(null);
    }
  };

  const resendVerification = async () => {
    if (firebaseUser?.email) {
      await sendVerificationEmail(firebaseUser.email);
    }
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchProfile(firebaseUser);
    }
  };

  const isRescuer = profile?.role === 'verified_rescuer' || profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        idToken,
        isRescuer,
        isAdmin,
        anonymousUid: getAnonymousUserId(),
        login,
        register,
        logout,
        resendVerification,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
