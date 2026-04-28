import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';

export const GET = withTelegramAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  
  if (!teamId) throw new Error('Missing teamId');

  const games = await gameService.getUpcomingGames(teamId);
  return { games };
});
