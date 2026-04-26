import { prisma } from '@/lib/prisma';
import { User } from '@/types/user';
import { TelegramUser } from '@/types/telegram';

// Prisma возвращает `id` как BigInt, который стандартный JSON.stringify не умеет сериализовать.
// Поэтому мы преобразуем его обратно в обычный JS Number, который отлично вмещает ID из Telegram.
const mapPrismaUser = (user: any): User => ({
  id: Number(user.id),
  username: user.username,
  first_name: user.first_name,
  last_name: user.last_name,
  created_at: user.created_at?.toISOString()
});

export const userService = {
  /**
   * Возвращает список всех пользователей
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        orderBy: { created_at: 'desc' }
      });
      return users.map(mapPrismaUser);
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Сохраняет или обновляет профиль пользователя
   */
  async upsertUser(tgUser: TelegramUser): Promise<User> {
    try {
      const user = await prisma.user.upsert({
        where: { id: BigInt(tgUser.id) },
        update: {
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
        },
        create: {
          id: BigInt(tgUser.id),
          username: tgUser.username || null,
          first_name: tgUser.first_name || null,
          last_name: tgUser.last_name || null,
        }
      });
      return mapPrismaUser(user);
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  },

  /**
   * Удаляет пользователя по ID
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      await prisma.user.delete({
        where: { id: BigInt(userId) }
      });
    } catch (error: any) {
      throw new Error(`Prisma error: ${error.message}`);
    }
  }
};
