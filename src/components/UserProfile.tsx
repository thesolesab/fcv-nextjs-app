'use client';

import { useState } from 'react';
import { useTelegram } from './providers/TelegramProvider';

interface UserProfileProps {
  onRefreshList: () => void;
}

export function UserProfile({ onRefreshList }: UserProfileProps) {
  const { user: telegramUser, initData } = useTelegram();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const registerUser = async () => {
    if (!initData) {
      setMessage('Нет данных initData. Откройте приложение в Telegram.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Пользователь успешно сохранен в БД!');
        onRefreshList();
      } else {
        setMessage(`Ошибка: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Ошибка сети: ${e.message}`);
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

      <div className="flex gap-2">
        <button 
          onClick={registerUser}
          disabled={loading || !initData}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Сохранение...' : 'Сохранить себя'}
        </button>
        <button 
          onClick={onRefreshList}
          disabled={loading || !initData}
          className="flex-1 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50 text-zinc-900 dark:text-zinc-100 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Загрузить всех
        </button>
      </div>

      {message && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-xs break-words">
          {message}
        </div>
      )}
    </div>
  );
}
