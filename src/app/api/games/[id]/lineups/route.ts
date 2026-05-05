import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';

export const GET = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  const lineups = await gameService.getGameLineups(gameId);
  return { lineups };
});

export const POST = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  const { name } = await req.json();
  
  if (!name) throw new Error('Missing lineup name');

  // Оставляем проверку прав на клиенте или можно добавить проверку роли COACH/ADMIN здесь
  const lineup = await gameService.createLineup(gameId, name);
  return { lineup };
});

export const DELETE = withTelegramAuth(async (req, user, context) => {
  const { searchParams } = new URL(req.url);
  const lineupId = searchParams.get('lineupId');
  if (!lineupId) throw new Error('Missing lineupId');
  
  await gameService.deleteLineup(lineupId);
  return { success: true };
});
