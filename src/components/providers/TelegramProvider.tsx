'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import { TelegramUser } from '@/types/telegram';

interface TelegramContextType {
  initData: string;
  user: TelegramUser | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  initData: '',
  user: null,
  isReady: false,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState('');
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    // Ждем монтирования на клиенте
    if (typeof window !== 'undefined') {
      try {
        WebApp.ready();
        setInitData(WebApp.initData);
        if (WebApp.initDataUnsafe?.user) {
          setUser(WebApp.initDataUnsafe.user as TelegramUser);
        }
      } catch (error) {
        console.error('Telegram WebApp error:', error);
      } finally {
        setIsReady(true);
      }
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ initData, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}
