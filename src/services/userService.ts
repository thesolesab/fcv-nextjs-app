import { supabaseAdmin } from '@/lib/supabase';
import { User } from '@/types/user';
import { TelegramUser } from '@/types/telegram';

export const userService = {
  /**
   * Возвращает список всех пользователей
   */
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error: ${error.message || JSON.stringify(error)}`);
    }

    return data as User[];
  },

  /**
   * Сохраняет или обновляет профиль пользователя
   */
  async upsertUser(tgUser: TelegramUser): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: tgUser.id,
        username: tgUser.username || null,
        first_name: tgUser.first_name || null,
        last_name: tgUser.last_name || null,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      throw new Error(`Database error: ${error.message || JSON.stringify(error)}`);
    }

    return data as User;
  },

  /**
   * Удаляет пользователя по ID
   */
  async deleteUser(userId: number): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(`Database error: ${error.message || JSON.stringify(error)}`);
    }
  }
};
