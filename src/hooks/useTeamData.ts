import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';

export function useTeamData(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return null;
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch team');
    return res.json();
  };

  const { data, error, isLoading } = useSWR(initData && teamId ? `/api/teams/${teamId}` : null, fetcher);

  return { team: data?.team, isLoading, error };
}

export function useGames(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return [];
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch games');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(initData && teamId ? `/api/games?teamId=${teamId}` : null, fetcher);

  const registerForGame = async (gameId: string, status: 'GOING' | 'NOT_GOING' | 'MAYBE') => {
    if (!initData) return;
    const res = await fetch('/api/games/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, gameId, status })
    });
    if (res.ok) {
      mutate(); // Re-fetch games to update registration counts
    }
  };

  return { games: data || [], isLoading, error, registerForGame };
}
