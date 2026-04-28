import { prisma } from '@/lib/prisma';
import { TelegramUser } from '@/types/telegram';
import { userService } from './userService';

export const teamService = {
  async getMyTeams(userId: number) {
    const teamMembers = await prisma.teamMember.findMany({
      where: { user_id: BigInt(userId) },
      include: { team: true },
      orderBy: { created_at: 'desc' }
    });

    return teamMembers.map(tm => ({
      ...tm.team,
      role: tm.role
    }));
  },

  async getTeamById(userId: number, teamId: string) {
    const teamMember = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } },
      include: { team: true }
    });

    if (!teamMember) throw new Error('Not a member');

    return { ...teamMember.team, role: teamMember.role };
  },

  async joinTeam(tgUser: TelegramUser, teamId: string) {
    // 1. Убедимся, что пользователь есть в БД
    await userService.upsertUser(tgUser);

    // 2. Добавим пользователя в команду
    return await prisma.teamMember.upsert({
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
  },

  async getSchedules(teamId: string) {
    return await prisma.teamSchedule.findMany({
      where: { team_id: teamId },
      orderBy: { day_of_week: 'asc' }
    });
  },

  async createSchedule(userId: number, teamId: string, dayOfWeek: number, time: string, location: string) {
    const member = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } }
    });

    if (!member || member.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    const schedule = await prisma.teamSchedule.create({
      data: {
        team_id: teamId,
        day_of_week: dayOfWeek,
        time,
        location
      }
    });

    // Сразу генерируем первую игру по этому расписанию
    const today = new Date();
    let daysUntil = dayOfWeek - today.getDay();
    if (daysUntil <= 0) daysUntil += 7; // Следующее наступление этого дня недели
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    const [hours, minutes] = time.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);

    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (team) {
      const newGame = await prisma.game.create({
        data: {
          team_id: teamId,
          date: nextDate,
          location,
          description: 'Автоматически созданная игра по новому расписанию'
        }
      });

      // Отправляем анонс в Telegram группу (импортируем gameMessageBuilder внутри функции чтобы избежать circular dependency или импортируем в начале)
      const { gameMessageBuilder } = await import('@/lib/gameMessageBuilder');
      if (team.telegram_chat_id) {
        await gameMessageBuilder.sendGameMessage(team.telegram_chat_id, newGame);
      }
    }

    return schedule;
  },

  async deleteSchedule(userId: number, teamId: string, scheduleId: string) {
    const member = await prisma.teamMember.findUnique({
      where: { user_id_team_id: { user_id: BigInt(userId), team_id: teamId } }
    });

    if (!member || member.role !== 'ADMIN') {
      throw new Error('Forbidden');
    }

    await prisma.teamSchedule.delete({
      where: { id: scheduleId }
    });
  }
};
