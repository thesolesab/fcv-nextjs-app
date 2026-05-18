'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { useProfile } from '@/hooks/useProfile';

const POSITIONS = [
  'Вратарь',
  'Защитник',
  'Полузащитник',
  'Нападающий',
  'Универсал'
];

function ProfileDashboard() {
  const router = useRouter();
  const { isReady, user } = useTelegram();
  const { profile, isLoading, updateProfile } = useProfile();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPosition(profile.position || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  if (!isReady || isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка профиля...</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile({
      first_name: firstName,
      last_name: lastName,
      position,
      phone
    });
    setIsSaving(false);
    alert('Профиль сохранен!');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Мой профиль</h1>
            <p className="text-sm text-zinc-500 mt-1">@{user?.username || 'Без юзернейма'}</p>
          </div>
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
             Назад
          </button>
        </div>

        {/* Profile Form */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <form onSubmit={handleSave} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Имя</label>
                <input 
                  type="text" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Фамилия</label>
                <input 
                  type="text" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Позиция на поле</label>
              <select 
                value={position} 
                onChange={e => setPosition(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Не выбрано</option>
                {POSITIONS.map((pos, i) => (
                  <option key={i} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Телефон</label>
              <input 
                type="tel" 
                placeholder="+7 (___) ___-__-__" 
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50 mt-4"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>}>
        <ProfileDashboard />
      </Suspense>
    </TelegramProvider>
  );
}
