'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { useTeamData, useArchiveGames } from '@/hooks/useTeamData';

function ArchiveDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { games, isLoading: gamesLoading } = useArchiveGames(teamId);

  if (!isReady || teamLoading || gamesLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Архив игр</h1>
            <p className="text-sm text-zinc-500 mt-1">{team?.name}</p>
          </div>
          <button onClick={() => router.back()} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
             Назад
          </button>
        </div>

        {/* Games Section */}
        <div>
          {games.length === 0 ? (
            <div className="text-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm shadow-sm">
              Нет прошедших игр
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game: any) => {
                const going = game.registrations?.filter((r: any) => r.status === 'GOING') || [];
                const lineups = game.lineups || [];
                
                return (
                  <div key={game.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                    <div className="mb-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        {new Date(game.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    
                    {lineups.length === 2 ? (
                      <div className="flex items-center justify-center space-x-3 mb-2">
                        <span className="font-medium text-sm">{lineups[0].name}</span>
                        <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg font-bold">
                          <span className="text-blue-500">{lineups[0].score ?? '-'}</span>
                          <span className="mx-1 text-zinc-400">:</span>
                          <span className="text-red-500">{lineups[1].score ?? '-'}</span>
                        </div>
                        <span className="font-medium text-sm">{lineups[1].name}</span>
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-500 text-center mb-2">Счет не записан</div>
                    )}

                    <div className="text-xs text-zinc-400 text-center">
                      Участников: {going.length}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

import { Suspense } from 'react';

export default function ArchivePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>}>
        <ArchiveDashboard teamId={unwrappedParams.id} />
      </Suspense>
    </TelegramProvider>
  );
}
