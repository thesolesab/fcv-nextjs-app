'use client';

import { User } from '@/types/user';
import { useState } from 'react';

interface UserListProps {
  users: User[];
  onDelete: (id: number) => Promise<void>;
  isLoading: boolean;
  error?: any;
}

export function UserList({ users, onDelete, isLoading, error }: UserListProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleDelete = async (userId: number) => {
    if (!confirm('Точно удалить пользователя?')) return;
    
    setLoadingId(userId);
    try {
      await onDelete(userId);
    } catch (e: any) {
      alert(`Ошибка: ${e.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-xl border border-red-100">
        <p className="font-semibold text-sm">Ошибка загрузки пользователей:</p>
        <p className="text-xs">{error.message}</p>
      </div>
    );
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="mt-4 p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-500">
        Загрузка пользователей...
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden mt-4">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <h2 className="font-semibold">Пользователи в БД ({users.length})</h2>
        {isLoading && <span className="text-xs text-zinc-400">Обновление...</span>}
      </div>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-64 overflow-y-auto">
        {users.map(u => (
          <li key={u.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <div>
              <p className="font-medium text-sm">{u.first_name} {u.last_name}</p>
              <p className="text-xs text-zinc-500">@{u.username} • ID: {u.id}</p>
            </div>
            <button
              onClick={() => handleDelete(u.id)}
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
