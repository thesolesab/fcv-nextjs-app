import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';

export const POST = withTelegramAuth(async (req, user) => {
  const { gameId, status } = await req.json();
  if (!gameId || !status) throw new Error('Missing gameId or status');

  const registration = await gameService.registerForGame(gameId, user.id, status);
  return { success: true, registration };
});
