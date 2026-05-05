import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';

export const POST = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  const { lineupId, userId } = await req.json();
  
  if (!lineupId || !userId) throw new Error('Missing lineupId or userId');

  await gameService.assignPlayerToLineup(lineupId, Number(userId), gameId);
  return { success: true };
});

export const DELETE = withTelegramAuth(async (req, user, context) => {
  const { searchParams } = new URL(req.url);
  const lineupId = searchParams.get('lineupId');
  const userId = searchParams.get('userId');
  
  if (!lineupId || !userId) throw new Error('Missing lineupId or userId');

  await gameService.removePlayerFromLineup(lineupId, Number(userId));
  return { success: true };
});
