import { prisma } from '@/lib/prisma';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';

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
   * Удаляет игру и связанное с ней сообщение в Telegram
   */
  async deleteGame(gameId: string, teamId: string) {
    try {
      // Сначала получаем игру, чтобы узнать ID сообщения
      const game = await prisma.game.findFirst({
        where: { id: gameId, team_id: teamId },
        include: { team: true }
      });

      if (!game) {
        throw new Error('Game not found or access denied');
      }

      // Удаляем игру из БД (каскадно удалятся и регистрации)
      await prisma.game.delete({
        where: { id: gameId }
      });

      // Если есть сообщение в Telegram, пытаемся его удалить
      if (game.telegram_message_id && game.team?.telegram_chat_id) {
        try {
          const { telegramApi } = await import('@/lib/telegramApi');
          await telegramApi.deleteMessage(game.team.telegram_chat_id, game.telegram_message_id);
        } catch (err) {
          console.error('Failed to delete Telegram message:', err);
          // Игнорируем ошибку удаления сообщения, главное что игра удалена из БД
        }
      }

      return true;
    } catch (error: any) {
      throw new Error(`Delete game error: ${error.message}`);
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
  },

  /**
   * Генерирует игры по расписанию на ближайшие 14 дней
   * @param teamId Опционально: сгенерировать только для конкретной команды
   */
  async generateMissingGames(teamId?: string) {
    try {
      const today = new Date();
      // Получаем расписание (для одной команды или для всех)
      const schedules = await prisma.teamSchedule.findMany({
        where: teamId ? { team_id: teamId } : undefined,
        include: { team: true }
      });

      let createdCount = 0;

      for (const schedule of schedules) {
        // Проверяем следующие 14 дней
        for (let i = 1; i <= 14; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + i);

          if (targetDate.getDay() === schedule.day_of_week) {
            const [hours, minutes] = schedule.time.split(':').map(Number);
            const gameDate = new Date(targetDate);
            gameDate.setHours(hours, minutes, 0, 0);

            // Проверяем, существует ли уже игра на эту дату (с погрешностью +- 1 час)
            const existingGame = await prisma.game.findFirst({
              where: {
                team_id: schedule.team_id,
                date: {
                  gte: new Date(gameDate.getTime() - 1000 * 60 * 60),
                  lte: new Date(gameDate.getTime() + 1000 * 60 * 60),
                }
              }
            });

            if (!existingGame) {
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
        }
      }
      return createdCount;
    } catch (error: any) {
      console.error('generateMissingGames error:', error);
      throw new Error(`Generate Games Error: ${error.message}`);
    }
  }
};
