'use client';

import { useTelegram } from './providers/TelegramProvider';
import { User } from '@/types/user';
import { useState } from 'react';

interface UserListProps {
  users: User[];
  onRefreshList: () => void;
}

export function UserList({ users, onRefreshList }: UserListProps) {
  const { initData } = useTelegram();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const deleteUser = async (userId: number) => {
    if (!initData || !confirm('Точно удалить пользователя?')) return;

    setLoadingId(userId);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData, userId })
      });
      
      if (res.ok) {
        onRefreshList();
      } else {
        const data = await res.json();
        alert(`Ошибка: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Ошибка сети: ${e.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  if (users.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-4">
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
              disabled={loadingId === u.id}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-md transition-colors disabled:opacity-50"
              title="Удалить"
            >
              {loadingId === u.id ? (
                <span className="text-xs">...</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
