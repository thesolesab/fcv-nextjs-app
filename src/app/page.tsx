'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { TeamList } from '@/components/TeamList';
import { useUsers } from '@/hooks/useUsers';
import { useTeams } from '@/hooks/useTeams';

function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady, startParam, initData, chat } = useTelegram();
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
      } else if (teams && !isLoading) {
        const noredirect = searchParams.get('noredirect');
        
        if (!noredirect) {
          // Если открыли из чата, переходим в команду этого чата
          if (chat?.id) {
            const currentTeam = teams.find((t: any) => Number(t.telegram_chat_id) === chat.id);
            if (currentTeam) {
              router.replace(`/team/${currentTeam.id}`);
              return;
            }
          }
          
          // Если команд всего одна - сразу заходим в нее
          if (teams.length === 1) {
            router.replace(`/team/${teams[0].id}`);
          }
        }
      }
    }
  }, [isReady, startParam, teams, isLoading, initData, router, searchParams, chat]);

  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Инициализация Telegram...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 bg-zinc-50 dark:bg-black text-black dark:text-white">
      <div className="max-w-md w-full space-y-6">
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h1 className="text-xl font-bold">Мои команды</h1>
          <button 
            onClick={() => router.push('/profile')}
            className="text-sm bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            👤 Профиль
          </button>
        </div>
        <TeamList teams={teams} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>}>
        <Dashboard />
      </Suspense>
    </TelegramProvider>
  );
}
