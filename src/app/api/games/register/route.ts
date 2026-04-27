import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData, getBotToken, getTelegramUserFromInitData } from '@/lib/telegramAuth';
import { gameService } from '@/services/gameService';

const requireTelegramAuth = (initData: string | null) => {
  if (!initData) throw new Error('Missing initData');
  const token = getBotToken();
  if (!validateTelegramWebAppData(initData, token)) throw new Error('Invalid Telegram data');
};

export async function POST(req: NextRequest) {
  try {
    const { initData, gameId, status } = await req.json();
    requireTelegramAuth(initData);

    const user = getTelegramUserFromInitData(initData);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    if (!['GOING', 'NOT_GOING', 'MAYBE'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const registration = await gameService.registerForGame(gameId, user.id, status as any);
    
    // Сериализация BigInt
    const serialized = JSON.stringify({ success: true, registration }, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    );

    return new NextResponse(serialized, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
