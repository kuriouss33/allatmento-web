'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Trash2, 
  Mail, 
  Clock, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { adminListUsers, adminSetUserRole, adminDeleteUser } from '@/lib/api';
import { UserProfile, UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function AdminPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { firebaseUser, idToken, isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const list = await adminListUsers(idToken);
      setUsers(list);
    } catch (err: any) {
      setError(err.message || 'Nem sikerült betölteni a felhasználók listáját.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/');
        return;
      }
      fetchUsers();
    }
  }, [authLoading, isAdmin, idToken]);

  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    if (!idToken) return;
    try {
      await adminSetUserRole(targetUid, newRole, idToken);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Hiba a szerepkör módosításakor.');
    }
  };

  const handleDeleteUser = async (targetUid: string) => {
    if (!idToken) return;
    if (!confirm('Biztosan véglegesen törlöd ezt a felhasználót?')) return;

    try {
      await adminDeleteUser(targetUid, idToken);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Hiba a felhasználó törlésekor.');
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="py-24 text-center text-slate-500 text-sm">
        Jogosultságok ellenőrzése...
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col max-w-4xl w-full mx-auto px-3 sm:px-6 py-2 sm:py-6 space-y-2 sm:space-y-4 overflow-hidden animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 sm:gap-3 shrink-0">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
            <span>{t.adminTitle}</span>
          </h1>
          <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 text-center">
            {t.adminSub}
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Frissítés</span>
        </button>
      </div>

      {error && (
        <div className="p-2.5 sm:p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-start gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Users List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 sm:space-y-3 pr-1 scrollbar-thin">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs font-semibold space-y-2">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Felhasználók betöltése...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs font-bold text-slate-500">Nincs regisztrált felhasználó a rendszerben.</p>
          </div>
        ) : (
          users.map((user) => {
            const isMe = firebaseUser?.uid === user.uid;
            return (
              <div
                key={user.uid}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {user.email || 'Névtelen felhasználó'}
                    </span>
                    {isMe && (
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                        {t.selfNotice}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>UID: {user.uid}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Current Role Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    user.role === 'super_admin'
                      ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                      : user.role === 'verified_rescuer'
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {user.role === 'super_admin' ? t.roleSuperAdmin : user.role === 'verified_rescuer' ? t.roleVerifiedRescuer : t.rolePending}
                  </span>

                  {/* Actions (if not me) */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 ml-2">
                      {user.role !== 'verified_rescuer' && (
                        <button
                          onClick={() => handleRoleChange(user.uid, 'verified_rescuer')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                        >
                          Mentővé tesz
                        </button>
                      )}

                      {user.role !== 'super_admin' && (
                        <button
                          onClick={() => handleRoleChange(user.uid, 'super_admin')}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                        >
                          Adminná tesz
                        </button>
                      )}

                      {user.role !== 'public' && (
                        <button
                          onClick={() => handleRoleChange(user.uid, 'public')}
                          className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          Visszavonás
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="p-1 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Törlés"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
