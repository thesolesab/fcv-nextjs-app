import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';

export function useSchedules(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return [];
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch schedules');
    const json = await res.json();
    return json.schedules || [];
  };

  const { data, error, isLoading, mutate } = useSWR(initData && teamId ? `/api/teams/schedule?teamId=${teamId}` : null, fetcher);

  const addSchedule = async (dayOfWeek: number, time: string, location: string) => {
    if (!initData) return;
    const res = await fetch('/api/teams/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, teamId, dayOfWeek, time, location })
    });
    if (res.ok) mutate();
  };

  const deleteSchedule = async (scheduleId: string) => {
    if (!initData) return;
    const res = await fetch('/api/teams/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, teamId, scheduleId })
    });
    if (res.ok) mutate();
  };

  return { schedules: data || [], isLoading, error, addSchedule, deleteSchedule };
}
