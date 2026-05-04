import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';

export function useTeams() {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return { teams: [] };
    const res = await fetch(url, {
      headers: {
        'x-telegram-init-data': initData,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(initData ? '/api/my-teams' : null, fetcher);

  const joinTeam = async (teamId: string) => {
    if (!initData) return;
    const res = await fetch('/api/teams/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': initData,
      },
      body: JSON.stringify({ teamId }),
    });
    if (res.ok) {
      mutate();
    }
  };

  return {
    teams: data?.teams || [],
    isLoading,
    error,
    joinTeam,
  };
}
