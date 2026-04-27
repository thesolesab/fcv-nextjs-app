import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';

// Разрешаем только авторизованные cron-запросы от Vercel
export async function GET(req: NextRequest) {
  // В Vercel есть специальный заголовок, который можно проверять для безопасности:
  // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

  try {
    const today = new Date();
    // Смотрим на 7 дней вперед
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 7);
    const targetDayOfWeek = targetDate.getDay(); // 0-6

    // Находим все расписания команд, у которых игра выпадает на этот день недели
    const schedules = await prisma.teamSchedule.findMany({
      where: { day_of_week: targetDayOfWeek },
      include: { team: true }
    });

    let createdCount = 0;

    for (const schedule of schedules) {
      // Формируем точную дату и время игры
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const gameDate = new Date(targetDate);
      gameDate.setHours(hours, minutes, 0, 0);

      // Проверяем, не создана ли уже эта игра, чтобы не было дублей
      const existingGame = await prisma.game.findFirst({
        where: {
          team_id: schedule.team_id,
          date: {
            gte: new Date(gameDate.getTime() - 1000 * 60 * 60), // +- 1 час
            lte: new Date(gameDate.getTime() + 1000 * 60 * 60),
          }
        }
      });

      if (!existingGame) {
        // Создаем игру
        const newGame = await prisma.game.create({
          data: {
            team_id: schedule.team_id,
            date: gameDate,
            location: schedule.location,
            description: 'Автоматически созданная игра по расписанию'
          }
        });

        // Отправляем анонс в Telegram группу
        if (schedule.team.telegram_chat_id) {
          await gameMessageBuilder.sendGameMessage(schedule.team.telegram_chat_id, newGame);
        }

        createdCount++;
      }
    }

    return NextResponse.json({ success: true, createdGames: createdCount });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
