'use client';

import { useState, useEffect } from 'react';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { UserProfile } from '@/components/UserProfile';
import { UserList } from '@/components/UserList';
import { User } from '@/types/user';

function Dashboard() {
  const { initData, isReady } = useTelegram();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    if (!initData) return;
    try {
      const res = await fetch('/api/users', {
        headers: { 'x-telegram-init-data': initData }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        console.error('Ошибка при получении пользователей:', data.error);
      }
    } catch (e: any) {
      console.error('Ошибка сети:', e.message);
    }
  };

  useEffect(() => {
    if (initData) {
      fetchUsers();
    }
  }, [initData]);

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm">Инициализация Telegram...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md w-full space-y-4">
        <UserProfile onRefreshList={fetchUsers} />
        <UserList users={users} onRefreshList={fetchUsers} />
      </div>
    </div>
  );
}

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <Dashboard />
    </TelegramProvider>
  );
}
