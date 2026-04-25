'use client';

import { useState } from 'react';
import { useTelegram } from './providers/TelegramProvider';

interface UserProfileProps {
  onRegister: () => Promise<void>;
}

export function UserProfile({ onRegister }: UserProfileProps) {
  const { user: telegramUser } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    setLoading(true);
    setMessage('');
    try {
      await onRegister();
      setMessage('Пользователь успешно сохранен в БД!');
    } catch (err: any) {
      setMessage(`Ошибка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
      <h1 className="text-2xl font-bold mb-1">Telegram + Supabase</h1>
      <p className="text-zinc-500 text-sm mb-4">Демонстрация работы с БД</p>
      
      {telegramUser ? (
        <div className="mb-4 flex items-center gap-3 bg-zinc-100 dark:bg-zinc-950 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {telegramUser.first_name?.charAt(0) || '?'}
          </div>
          <div>
            <p className="font-medium text-sm">{telegramUser.first_name} {telegramUser.last_name}</p>
            <p className="text-xs text-zinc-500">@{telegramUser.username || 'unknown'} (ID: {telegramUser.id})</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-amber-600 mb-4">Данные профиля недоступны. Откройте в Telegram.</p>
      )}

      <button 
        onClick={handleRegister}
        disabled={loading || !telegramUser}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-3 px-4 rounded-lg transition-colors text-sm"
      >
        {loading ? 'Сохранение...' : 'Сохранить себя'}
      </button>

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-xs break-words ${message.includes('Ошибка') ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
