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

  const deleteGame = async (gameId: string) => {
    if (!initData) return;
    const res = await fetch(`/api/games?gameId=${gameId}&teamId=${teamId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) {
      mutate();
    }
  };

  return { games: data?.games || [], isLoading, error, registerForGame, deleteGame };
}

export function useArchiveGames(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return [];
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch archive games');
    return res.json();
  };

  const { data, error, isLoading } = useSWR(initData && teamId ? `/api/games/archive?teamId=${teamId}` : null, fetcher);

  return { games: data?.games || [], isLoading, error };
}

export function useTeamMembers(teamId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return [];
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(initData && teamId ? `/api/teams/${teamId}/members` : null, fetcher);

  const updateRole = async (targetUserId: number, newRole: string) => {
    if (!initData) return;
    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ targetUserId, newRole })
    });
    if (res.ok) mutate();
  };

  return { members: data?.members || [], isLoading, error, updateRole };
}

export function useGameLineups(gameId: string) {
  const { initData } = useTelegram();

  const fetcher = async (url: string) => {
    if (!initData) return [];
    const res = await fetch(url, { headers: { 'x-telegram-init-data': initData } });
    if (!res.ok) throw new Error('Failed to fetch lineups');
    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR(initData && gameId ? `/api/games/${gameId}/lineups` : null, fetcher);

  const createLineup = async (name: string) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ name })
    });
    if (res.ok) mutate();
  };

  const deleteLineup = async (lineupId: string) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups?lineupId=${lineupId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) mutate();
  };

  const assignPlayer = async (lineupId: string, userId: number) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ lineupId, userId })
    });
    if (res.ok) mutate();
  };

  const removePlayer = async (lineupId: string, userId: number) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/players?lineupId=${lineupId}&userId=${userId}`, {
      method: 'DELETE',
      headers: { 'x-telegram-init-data': initData }
    });
    if (res.ok) mutate();
  };

  const updateLineupScore = async (lineupId: string, score: number) => {
    if (!initData) return;
    const res = await fetch(`/api/games/${gameId}/lineups/score`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-telegram-init-data': initData },
      body: JSON.stringify({ lineupId, score })
    });
    if (res.ok) mutate();
  };

  return { 
    lineups: data?.lineups || [], 
    isLoading, 
    error, 
    createLineup, 
    deleteLineup, 
    assignPlayer, 
    removePlayer,
    updateLineupScore
  };
}
