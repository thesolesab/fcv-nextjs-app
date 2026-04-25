import { prisma } from '@/lib/prisma';
import { TelegramUser } from '@/types/telegram';
import { User } from '@/types/user';

// Вспомогательная функция для безопасной конвертации Prisma User в наш интерфейс
// Так как Prisma возвращает id как BigInt, а JSON.stringify не умеет работать с BigInt
const mapPrismaUser = (u: any): User => ({
  id: Number(u.id),
  username: u.username,
  first_name: u.first_name,
  last_name: u.last_name,
  created_at: u.created_at?.toISOString()
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
      throw new Error(`Database error: ${error.message}`);
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
      throw new Error(`Database error: ${error.message}`);
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
      // Prisma throws an error if record doesn't exist. We can ignore it or rethrow.
      if (error.code === 'P2025') return; // Record to delete does not exist.
      throw new Error(`Database error: ${error.message}`);
    }
  }
};
