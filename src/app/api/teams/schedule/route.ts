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

    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) return NextResponse.json({ error: 'Missing teamId' }, { status: 400 });

    const schedules = await prisma.teamSchedule.findMany({
      where: { team_id: teamId },
      orderBy: { day_of_week: 'asc' }
    });

    return NextResponse.json({ schedules });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { initData, teamId, dayOfWeek, time, location } = await req.json();
    requireTelegramAuth(initData);

    const user = getTelegramUserFromInitData(initData);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // Проверяем, что пользователь ADMIN в команде
    const member = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(user.id), team_id: teamId } }
    });

    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const schedule = await prisma.teamSchedule.create({
      data: {
        team_id: teamId,
        day_of_week: Number(dayOfWeek),
        time,
        location
      }
    });

    return NextResponse.json({ success: true, schedule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { initData, scheduleId, teamId } = await req.json();
    requireTelegramAuth(initData);

    const user = getTelegramUserFromInitData(initData);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    const member = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(user.id), team_id: teamId } }
    });

    if (!member || member.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.teamSchedule.delete({
      where: { id: scheduleId }
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
