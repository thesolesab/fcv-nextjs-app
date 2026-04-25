'use client';

import { useState, useEffect } from 'react';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { UserProfile } from '@/components/UserProfile';
import { UserList } from '@/components/UserList';
import { useUsers } from '@/hooks/useUsers';

function Dashboard() {
  const { isReady } = useTelegram();
  const { users, isLoading, error, registerUser, deleteUser } = useUsers();

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Инициализация Telegram...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md w-full space-y-4">
        <UserProfile onRegister={registerUser} />
        <UserList 
          users={users} 
          onDelete={deleteUser} 
          isLoading={isLoading} 
          error={error} 
        />
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
