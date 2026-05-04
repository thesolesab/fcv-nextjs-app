'use client';

import { useState, useEffect } from 'react';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { UserProfile } from '@/components/UserProfile';
import { TeamList } from '@/components/TeamList';
import { useUsers } from '@/hooks/useUsers';
import { useTeams } from '@/hooks/useTeams';

function Dashboard() {
  const { isReady, startParam } = useTelegram();
  const { registerUser } = useUsers();
  const { teams, isLoading, error, joinTeam } = useTeams();

  // Автоматическое вступление в команду при наличии startapp параметра
  useEffect(() => {
    if (isReady && startParam) {
      if (!startParam.startsWith('game_')) {
        // Регистрируем юзера на всякий случай
        registerUser().catch(() => {});
        // Вступаем в команду (параметр является teamId)
        joinTeam(startParam).catch(() => {});
      }
    }
  }, [isReady, startParam]);

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Инициализация Telegram...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md w-full space-y-6">
        <UserProfile onRegister={registerUser} />
        <TeamList teams={teams} isLoading={isLoading} error={error} />
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
