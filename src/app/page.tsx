'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { TeamList } from '@/components/TeamList';
import { useUsers } from '@/hooks/useUsers';
import { useTeams } from '@/hooks/useTeams';

function Dashboard() {
  const router = useRouter();
  const { isReady, startParam, initData } = useTelegram();
  const { registerUser } = useUsers();
  const { teams, isLoading, error, joinTeam } = useTeams();

  // Автоматическое вступление в команду при наличии startapp параметра
  useEffect(() => {
    if (isReady) {
      if (startParam) {
        if (startParam.startsWith('game_')) {
          const gameId = startParam.replace('game_', '');
          fetch(`/api/games/${gameId}`, { headers: { 'x-telegram-init-data': initData || '' } })
            .then(res => res.json())
            .then(data => {
              if (data.game) {
                router.push(`/team/${data.game.team_id}`);
              }
            }).catch(console.error);
        } else {
          // Регистрируем юзера на всякий случай
          registerUser().catch(() => { });
          // Вступаем в команду (параметр является teamId)
          joinTeam(startParam).catch(() => { });
        }
      } else if (teams && teams.length === 1) {
        // Если только 1 команда и нет параметров - сразу заходим в нее
        router.push(`/team/${teams[0].id}`);
      }
    }
  }, [isReady, startParam, teams, initData, router]);

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Инициализация Telegram...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md w-full space-y-6">
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
