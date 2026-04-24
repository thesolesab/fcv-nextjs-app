'use client';

import { useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

type User = {
  id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
};

export default function Home() {
  const [initData, setInitData] = useState('');
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // WebApp works only in the browser
    if (typeof window !== 'undefined') {
      WebApp.ready();
      setInitData(WebApp.initData);
      
      if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
        setTelegramUser(WebApp.initDataUnsafe.user);
      }
    }
  }, []);

  if (!isMounted) return null; // Prevent hydration mismatch


  const registerUser = async () => {
    if (!initData) {
      setMessage('No initData available. Open in Telegram.');
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
        fetchUsers(); // Refresh list
      } else {
        setMessage(`Ошибка: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Ошибка сети: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!initData) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        headers: {
          'x-telegram-init-data': initData
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setMessage(`Ошибка при получении пользователей: ${data.error}`);
      }
    } catch (e: any) {
      setMessage(`Ошибка сети: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: number) => {
    if (!initData || !confirm('Точно удалить пользователя?')) return;

    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, userId })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage('Пользователь удален.');
        fetchUsers(); // Refresh list
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
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md w-full space-y-4">
        
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
              Сохранить себя
            </button>
            <button 
              onClick={fetchUsers}
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

        {users.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="font-semibold">Пользователи в БД ({users.length})</h2>
            </div>
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-64 overflow-y-auto">
              {users.map(u => (
                <li key={u.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div>
                    <p className="font-medium text-sm">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-zinc-500">@{u.username} • ID: {u.id}</p>
                  </div>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors"
                    title="Удалить"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
