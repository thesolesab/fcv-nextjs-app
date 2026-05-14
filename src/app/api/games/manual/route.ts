import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';
import { teamService } from '@/services/teamService';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';

export const POST = withTelegramAuth(async (req, user) => {
  const { teamId, date, time, location, description } = await req.json();

  if (!teamId || !date || !time) {
    throw new Error('Missing required fields');
  }

  // Проверка прав
  const team = await teamService.getTeamById(user.id, teamId);
  if (team.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }

  // Парсим дату и время
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  const gameDate = new Date();
  gameDate.setFullYear(year, month - 1, day);
  gameDate.setHours(hours, minutes, 0, 0);

  // Создаем игру
  const game = await gameService.createGame(teamId, gameDate, location, description);

  // Отправляем сообщение в Telegram
  if (team.telegram_chat_id) {
    await gameMessageBuilder.sendGameMessage(team.telegram_chat_id, game);
  }

  return { game };
});
