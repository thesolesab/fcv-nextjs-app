import { prisma } from '@/lib/prisma';

export const gameService = {
  /**
   * Создает новую игру для команды
   */
  async createGame(teamId: string, date: Date, location?: string, description?: string) {
    try {
      return await prisma.game.create({
        data: {
          team_id: teamId,
          date,
          location,
          description,
        }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Возвращает будущие игры для команды
   */
  async getUpcomingGames(teamId: string) {
    try {
      return await prisma.game.findMany({
        where: {
          team_id: teamId,
          date: { gte: new Date() } // Только будущие
        },
        orderBy: { date: 'asc' },
        include: {
          registrations: {
            include: { user: true }
          }
        }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Запись пользователя на игру (Идет / Не идет)
   */
  async registerForGame(gameId: string, userId: number, status: 'GOING' | 'NOT_GOING' | 'MAYBE') {
    try {
      return await prisma.gameRegistration.upsert({
        where: {
          game_id_user_id: {
            game_id: gameId,
            user_id: BigInt(userId)
          }
        },
        update: { status },
        create: {
          game_id: gameId,
          user_id: BigInt(userId),
          status
        }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  }
};
