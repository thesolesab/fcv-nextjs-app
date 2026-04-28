'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { useTeamData, useGames } from '@/hooks/useTeamData';

function TeamDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady, user } = useTelegram();
  const { team, isLoading: teamLoading, error: teamError } = useTeamData(teamId);
  const { games, isLoading: gamesLoading, registerForGame } = useGames(teamId);

  if (!isReady) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>;
  if (teamLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка команды...</div>;
  if (teamError || !team) return <div className="min-h-screen flex items-center justify-center text-red-500">Ошибка или нет доступа</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{team.name}</h1>
            <p className="text-sm text-zinc-500 mt-1">{team.role === 'ADMIN' ? '👑 Администратор' : 'Участник'}</p>
          </div>
          <button onClick={() => router.push('/')} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
             Назад
          </button>
        </div>

        {/* Admin Section */}
        {team.role === 'ADMIN' && (
          <button 
            onClick={() => router.push(`/team/${teamId}/admin`)}
            className="w-full flex items-center justify-center space-x-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 rounded-xl transition-colors font-medium border border-blue-500/20"
          >
            <span>⚙️</span>
            <span>Настройки расписания</span>
          </button>
        )}

        {/* Games Section */}
        <div>
          <h2 className="text-lg font-bold mb-3 px-1">Предстоящие игры</h2>
          {gamesLoading ? (
            <div className="text-center text-zinc-500 py-4">Загрузка игр...</div>
          ) : games.length === 0 ? (
            <div className="text-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm shadow-sm">
              Нет запланированных игр
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game: any) => {
                const going = game.registrations?.filter((r: any) => r.status === 'GOING') || [];
                const notGoing = game.registrations?.filter((r: any) => r.status === 'NOT_GOING') || [];
                // Найти статус текущего юзера
                const myReg = game.registrations?.find((r: any) => r.user_id === user?.id);
                
                return (
                  <div key={game.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {new Date(game.date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                        <div className="text-zinc-500 text-sm mt-1">
                          ⏰ {new Date(game.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                          {game.location && ` • 📍 ${game.location}`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Кнопки записи */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button 
                        onClick={() => registerForGame(game.id, 'GOING')}
                        className={`py-2 rounded-xl font-medium transition-all active:scale-[0.98] ${myReg?.status === 'GOING' ? 'bg-green-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                      >
                        ✅ Иду
                      </button>
                      <button 
                        onClick={() => registerForGame(game.id, 'NOT_GOING')}
                        className={`py-2 rounded-xl font-medium transition-all active:scale-[0.98] ${myReg?.status === 'NOT_GOING' ? 'bg-red-500 text-white shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
                      >
                        ❌ Не иду
                      </button>
                    </div>

                    {/* Статистика */}
                    <div className="flex justify-between text-xs text-zinc-500 mt-2 px-1">
                      <span>Идут: {going.length}</span>
                      <span>Не идут: {notGoing.length}</span>
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

export default function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <TeamDashboard teamId={unwrappedParams.id} />
    </TelegramProvider>
  );
}
