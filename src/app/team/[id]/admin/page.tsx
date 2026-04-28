'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramProvider, useTelegram } from '@/components/providers/TelegramProvider';
import { useTeamData } from '@/hooks/useTeamData';
import { useSchedules } from '@/hooks/useSchedules';

const DAYS_OF_WEEK = [
  'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
];

function AdminDashboard({ teamId }: { teamId: string }) {
  const router = useRouter();
  const { isReady } = useTelegram();
  const { team, isLoading: teamLoading } = useTeamData(teamId);
  const { schedules, isLoading: schedLoading, addSchedule, deleteSchedule } = useSchedules(teamId);

  const [day, setDay] = useState(1); // Пн по умолчанию
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  if (!isReady || teamLoading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Загрузка...</div>;
  if (!team || team.role !== 'ADMIN') return <div className="min-h-screen flex items-center justify-center text-red-500">Доступ запрещен</div>;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    await addSchedule(day, time, location);
    setLocation('');
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Настройки расписания</h1>
            <p className="text-sm text-zinc-500 mt-1">{team.name}</p>
          </div>
          <button onClick={() => router.push(`/team/${teamId}`)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
             Готово
          </button>
        </div>

        {/* Existing Schedules */}
        <div>
          <h2 className="text-lg font-bold mb-3 px-1">Текущее расписание</h2>
          {schedLoading ? (
            <div className="text-center text-zinc-500 py-4">Загрузка...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 text-sm shadow-sm">
              Расписание не настроено. Бот не будет автоматически создавать игры.
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((s: any) => (
                <div key={s.id} className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{DAYS_OF_WEEK[s.day_of_week]}, {s.time}</div>
                    {s.location && <div className="text-xs text-zinc-500 mt-1">📍 {s.location}</div>}
                  </div>
                  <button 
                    onClick={() => deleteSchedule(s.id)}
                    className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Schedule Form */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <h2 className="text-lg font-bold mb-4">Добавить тренировку</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">День недели</label>
                <select 
                  value={day} 
                  onChange={e => setDay(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Время</label>
                <input 
                  type="time" 
                  value={time} 
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Локация (опционально)</label>
              <input 
                type="text" 
                placeholder="Стадион, адрес или ссылка" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit" 
              disabled={isAdding}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50"
            >
              {isAdding ? 'Добавление...' : 'Добавить в расписание'}
            </button>
            <p className="text-xs text-zinc-500 mt-3 text-center">
              Игры по этому расписанию будут автоматически создаваться ботом за 7 дней до начала.
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}

export default function AdminPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  if (!isMounted) return null;

  return (
    <TelegramProvider>
      <AdminDashboard teamId={unwrappedParams.id} />
    </TelegramProvider>
  );
}
