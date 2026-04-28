import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData, getBotToken, getTelegramUserFromInitData } from '@/lib/telegramAuth';
import { TelegramUser } from '@/types/telegram';

type ApiHandler = (req: NextRequest, user: TelegramUser, context?: any) => Promise<any>;

/**
 * Обертка для API-роутов.
 * 1. Проверяет x-telegram-init-data в заголовках.
 * 2. Валидирует подпись Telegram.
 * 3. Извлекает пользователя.
 * 4. Обрабатывает try/catch и сериализует BigInt.
 */
export function withTelegramAuth(handler: ApiHandler) {
  return async (req: NextRequest, context?: any) => {
    try {
      // 1. Извлекаем токен из заголовка или тела
      let initData = req.headers.get('x-telegram-init-data');
      
      if (!initData && req.method !== 'GET') {
        try {
          const body = await req.clone().json();
          initData = body.initData;
        } catch (e) {}
      }

      if (!initData) {
        return NextResponse.json({ error: 'Missing initData in header or body' }, { status: 401 });
      }

      // 2. Валидируем подпись
      if (!validateTelegramWebAppData(initData, getBotToken())) {
        return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 401 });
      }

      // 3. Извлекаем пользователя
      const user = getTelegramUserFromInitData(initData);
      if (!user) {
        return NextResponse.json({ error: 'User data not found in initData' }, { status: 401 });
      }

      // 4. Выполняем основную логику контроллера
      const result = await handler(req, user, context);

      // 5. Автоматически сериализуем BigInt в Number для ответа
      const serialized = JSON.stringify(result, (k, v) => typeof v === 'bigint' ? Number(v) : v);

      return new NextResponse(serialized, {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      
    } catch (error: any) {
      console.error('[API Error]:', error);
      const status = error.message?.includes('Not Found') ? 404 : 500;
      return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status });
    }
  };
}
