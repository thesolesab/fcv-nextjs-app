import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData, getBotToken, getTelegramUserFromInitData } from '@/lib/telegramAuth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const initData = req.headers.get('x-telegram-init-data');
    if (!initData) throw new Error('Missing initData');
    if (!validateTelegramWebAppData(initData, getBotToken())) throw new Error('Invalid Telegram data');

    const user = getTelegramUserFromInitData(initData);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const params = await context.params;
    const teamId = params.id;

    const teamMember = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(user.id), team_id: teamId } },
      include: { team: true }
    });

    if (!teamMember) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

    const team = { ...teamMember.team, role: teamMember.role };
    const serialized = JSON.stringify({ team }, (k, v) => typeof v === 'bigint' ? Number(v) : v);

    return new NextResponse(serialized, { headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
