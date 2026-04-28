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

  const { data, error, isLoading } = useSWR(initData ? '/api/my-teams' : null, fetcher);

  return {
    teams: data?.teams || [],
    isLoading,
    error,
  };
}
