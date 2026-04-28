import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData, getBotToken, getTelegramUserFromInitData } from '@/lib/telegramAuth';
import { prisma } from '@/lib/prisma';

const requireTelegramAuth = (initData: string | null) => {
  if (!initData) throw new Error('Missing initData');
  const token = getBotToken();
  if (!validateTelegramWebAppData(initData, token)) throw new Error('Invalid Telegram data');
};

export async function GET(req: NextRequest) {
  try {
    const initData = req.headers.get('x-telegram-init-data');
    requireTelegramAuth(initData);

    const user = getTelegramUserFromInitData(initData);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const teamMembers = await prisma.teamMember.findMany({
      where: { user_id: BigInt(user.id) },
      include: { team: true },
      orderBy: { created_at: 'desc' }
    });

    const teams = teamMembers.map(tm => ({
      ...tm.team,
      role: tm.role
    }));

    const serialized = JSON.stringify({ teams }, (key, value) =>
      typeof value === 'bigint' ? Number(value) : value
    );

    return new NextResponse(serialized, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
