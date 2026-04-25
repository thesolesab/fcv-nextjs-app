import useSWR from 'swr';
import { useTelegram } from '@/components/providers/TelegramProvider';
import { User } from '@/types/user';

// Универсальный фетчер для SWR
const fetcher = async ([url, initData]: [string, string]) => {
  const res = await fetch(url, {
    headers: { 'x-telegram-init-data': initData },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Ошибка при загрузке данных');
  }
  return res.json();
};

export function useUsers() {
  const { initData } = useTelegram();

  // SWR автоматически управляет кэшем, загрузкой и ошибками.
  // Ключ состоит из URL и initData (если initData нет, запрос не идет).
  const { data, error, isLoading, mutate } = useSWR(
    initData ? ['/api/users', initData] : null,
    fetcher
  );

  const users: User[] = data?.users || [];

  const registerUser = async () => {
    if (!initData) throw new Error('No initData');

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Ошибка при сохранении');
    }
    
    // Обновляем список пользователей
    mutate();
    return res.json();
  };

  const deleteUser = async (userId: number) => {
    if (!initData) throw new Error('No initData');

    const res = await fetch('/api/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initData, userId })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Ошибка при удалении');
    }

    // Обновляем список, можно оптимистично убрать удаленного юзера из кэша
    mutate((currentData: any) => ({
      ...currentData,
      users: currentData?.users?.filter((u: User) => u.id !== userId) || []
    }), false);
    
    return res.json();
  };

  return {
    users,
    isLoading,
    error,
    registerUser,
    deleteUser
  };
}
