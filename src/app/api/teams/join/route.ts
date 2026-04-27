import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData, getBotToken, getTelegramUserFromInitData } from '@/lib/telegramAuth';
import { prisma } from '@/lib/prisma';
import { userService } from '@/services/userService';

const requireTelegramAuth = (initData: string | null) => {
  if (!initData) throw new Error('Missing initData');
  const token = getBotToken();
  if (!validateTelegramWebAppData(initData, token)) throw new Error('Invalid Telegram data');
};

export async function POST(req: NextRequest) {
  try {
    const { initData, teamId } = await req.json();
    requireTelegramAuth(initData);

    const tgUser = getTelegramUserFromInitData(initData);
    if (!tgUser) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // 1. Убедимся, что пользователь есть в БД
    await userService.upsertUser(tgUser);

    // 2. Добавим пользователя в команду
    const teamMember = await prisma.teamMember.upsert({
      where: {
        user_id_team_id: {
          user_id: BigInt(tgUser.id),
          team_id: teamId
        }
      },
      update: {}, // Если уже есть, ничего не делаем
      create: {
        user_id: BigInt(tgUser.id),
        team_id: teamId,
        role: 'MEMBER'
      }
    });

    const serialized = JSON.stringify({ success: true, teamMember }, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    );

    return new NextResponse(serialized, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
