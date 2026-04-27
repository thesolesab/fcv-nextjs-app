import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData, getBotToken, getTelegramUserFromInitData } from '@/lib/telegramAuth';
import { gameService } from '@/services/gameService';

const requireTelegramAuth = (initData: string | null) => {
  if (!initData) throw new Error('Missing initData');
  const token = getBotToken();
  if (!validateTelegramWebAppData(initData, token)) throw new Error('Invalid Telegram data');
};

// Получить будущие игры команды
export async function GET(req: NextRequest) {
  try {
    const initData = req.headers.get('x-telegram-init-data');
    requireTelegramAuth(initData);

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json({ error: 'Missing teamId parameter' }, { status: 400 });
    }

    const games = await gameService.getUpcomingGames(teamId);
    
    // Сериализация BigInt перед отправкой JSON
    const serialized = JSON.stringify(games, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    );

    return new NextResponse(serialized, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Создать новую игру (только для админов)
export async function POST(req: NextRequest) {
  try {
    const { initData, teamId, date, location, description } = await req.json();
    requireTelegramAuth(initData);

    const user = getTelegramUserFromInitData(initData);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // TODO: Здесь нужна проверка, что пользователь имеет роль ADMIN в команде (через prisma.teamMember)
    // Для упрощения сейчас разрешаем создание всем.

    const newGame = await gameService.createGame(teamId, new Date(date), location, description);
    
    return NextResponse.json({ success: true, game: newGame });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
