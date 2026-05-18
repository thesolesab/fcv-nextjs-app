import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';

const fetcher = async ([url, initData]: [string, string]) => {
  const res = await fetch(url, {
    headers: { 'x-telegram-init-data': initData },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
};

export function useProfile() {
  const { initData } = useTelegram();

  const { data, error, isLoading, mutate } = useSWR(
    initData ? ['/api/users/me', initData] : null,
    fetcher
  );

  const updateProfile = async (profileData: any) => {
    if (!initData) return;
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': initData,
      },
      body: JSON.stringify(profileData),
    });
    if (res.ok) {
      mutate();
    }
  };

  return {
    profile: data?.user || null,
    isLoading,
    error,
    updateProfile,
  };
}
