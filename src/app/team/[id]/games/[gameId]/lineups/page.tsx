'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { useTeamData, useGameLineups, useGames } from '@/hooks/useTeamData';

function LineupsDashboard({ teamId, gameId }: { teamId: string, gameId: string }) {
  const router = useRouter();
  const { isReady, user } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { games, isLoading: gamesLoading } = useGames(teamId);
  const { lineups, isLoading: lineupsLoading, createLineup, deleteLineup, assignPlayer, removePlayer, updateLineupScore } = useGameLineups(gameId);
  
  const [newLineupName, setNewLineupName] = useState('');
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [score1, setScore1] = useState<number | ''>('');
  const [score2, setScore2] = useState<number | ''>('');

  if (!isReady || teamLoading || gamesLoading || lineupsLoading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>;
  }

  const game = games.find((g: any) => g.id === gameId);
  if (!game || !team) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Ошибка</div>;
  }

  const isCoachOrAdmin = team.role === 'ADMIN' || team.role === 'COACH';
  const isAdmin = team.role === 'ADMIN';

  // Собираем всех "Идущих"
  const goingRegistrations = game.registrations?.filter((r: any) => r.status === 'GOING') || [];
  
  // Находим тех, кто еще не распределен
  const assignedUserIds = new Set();
  lineups.forEach((l: any) => {
    l.players.forEach((p: any) => assignedUserIds.add(Number(p.user_id)));
  });

  const availablePlayers = goingRegistrations.filter((r: any) => !assignedUserIds.has(Number(r.user_id)));

  const handleAddLineup = async () => {
    if (newLineupName.trim()) {
      await createLineup(newLineupName.trim());
      setNewLineupName('');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Составы на игру</h1>
            <p className="text-sm text-zinc-500 mt-1">
              {new Date(game.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button onClick={() => router.push(`/team/${teamId}`)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
             Назад
          </button>
        </div>

        {/* Результаты игры (только если 2 команды) */}
        {lineups.length === 2 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm text-center">
            <h2 className="text-sm font-bold text-zinc-500 mb-3 uppercase">Результат матча</h2>
            <div className="flex items-center justify-center space-x-6">
              <div className="text-right flex-1 font-medium">{lineups[0].name}</div>
              
              {isEditingScore ? (
                <div className="flex items-center space-x-2">
                  <input 
                    type="number" 
                    value={score1 === '' ? (lineups[0].score ?? '') : score1} 
                    onChange={e => setScore1(e.target.value ? Number(e.target.value) : '')}
                    className="w-12 h-12 text-center text-xl font-bold bg-zinc-100 dark:bg-zinc-800 rounded-xl border-none outline-none"
                  />
                  <span className="text-2xl font-bold text-zinc-300">:</span>
                  <input 
                    type="number" 
                    value={score2 === '' ? (lineups[1].score ?? '') : score2} 
                    onChange={e => setScore2(e.target.value ? Number(e.target.value) : '')}
                    className="w-12 h-12 text-center text-xl font-bold bg-zinc-100 dark:bg-zinc-800 rounded-xl border-none outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-3 bg-zinc-50 dark:bg-zinc-800 px-6 py-3 rounded-2xl">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{lineups[0].score ?? '-'}</span>
                  <span className="text-xl font-bold text-zinc-300">:</span>
                  <span className="text-3xl font-bold text-red-600 dark:text-red-400">{lineups[1].score ?? '-'}</span>
                </div>
              )}
              
              <div className="text-left flex-1 font-medium">{lineups[1].name}</div>
            </div>
            
            <div className="mt-4">
              {isEditingScore ? (
                <button 
                  onClick={async () => {
                    if (score1 !== '') await updateLineupScore(lineups[0].id, Number(score1));
                    if (score2 !== '') await updateLineupScore(lineups[1].id, Number(score2));
                    setIsEditingScore(false);
                  }}
                  className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium text-sm hover:bg-green-600 transition-colors"
                >
                  Сохранить
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setScore1(lineups[0].score ?? '');
                    setScore2(lineups[1].score ?? '');
                    setIsEditingScore(true);
                  }}
                  className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  ✏️ Изменить счет
                </button>
              )}
            </div>
          </div>
        )}

        {/* Available Players */}
        {isCoachOrAdmin && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
            <h2 className="text-sm font-bold text-zinc-500 mb-3">ДОСТУПНЫЕ ИГРОКИ ({availablePlayers.length})</h2>
            <div className="flex flex-wrap gap-2">
              {availablePlayers.length === 0 ? (
                <div className="text-sm text-zinc-400">Все распределены</div>
              ) : (
                availablePlayers.map((r: any) => (
                  <div key={r.user_id} className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg text-sm">
                    <span>{r.user.first_name || r.user.username || 'Игрок'}</span>
                    <select 
                      onChange={(e) => {
                        if (e.target.value) assignPlayer(e.target.value, r.user_id);
                        e.target.value = "";
                      }}
                      className="ml-2 bg-transparent text-blue-500 text-xs outline-none cursor-pointer"
                    >
                      <option value="">В команду...</option>
                      {lineups.map((l: any) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Lineups */}
        <div className="space-y-4">
          {lineups.map((lineup: any) => (
            <div key={lineup.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{lineup.name} ({lineup.players.length})</h3>
                {isAdmin && (
                  <button onClick={() => deleteLineup(lineup.id)} className="text-red-500 hover:text-red-600 p-1">
                    🗑️
                  </button>
                )}
              </div>
              
              <div className="space-y-2">
                {lineup.players.length === 0 ? (
                  <div className="text-sm text-zinc-400">Пусто</div>
                ) : (
                  lineup.players.map((p: any) => (
                    <div key={p.user_id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg text-sm">
                      <span>{p.user.first_name || p.user.username || 'Игрок'}</span>
                      {isCoachOrAdmin && (
                        <button onClick={() => removePlayer(lineup.id, p.user_id)} className="text-zinc-400 hover:text-red-500 px-2">
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Lineup */}
        {isAdmin && (
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newLineupName}
              onChange={e => setNewLineupName(e.target.value)}
              placeholder="Новая команда..."
              className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button 
              onClick={handleAddLineup}
              disabled={!newLineupName.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 rounded-xl transition-colors font-medium text-sm"
            >
              Добавить
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function LineupsPage({ params }: { params: Promise<{ id: string, gameId: string }> }) {
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <LineupsDashboard teamId={unwrappedParams.id} gameId={unwrappedParams.gameId} />
    </TelegramProvider>
  );
}
