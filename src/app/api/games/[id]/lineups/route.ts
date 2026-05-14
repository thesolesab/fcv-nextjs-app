import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';
import { prisma } from '@/lib/prisma';

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

  // Получаем игру и проверяем права
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Game not found');
  
  const member = await prisma.teamMember.findUnique({
    where: { user_id_team_id: { user_id: BigInt(user.id), team_id: game.team_id } }
  });
  if (!member || member.role !== 'ADMIN') throw new Error('Forbidden');

  const lineup = await gameService.createLineup(gameId, name);
  return { lineup };
});

export const DELETE = withTelegramAuth(async (req, user, context) => {
  const { searchParams } = new URL(req.url);
  const lineupId = searchParams.get('lineupId');
  if (!lineupId) throw new Error('Missing lineupId');

  // Проверяем права (нужен game_id для получения team_id)
  const lineup = await prisma.gameLineup.findUnique({ where: { id: lineupId }, include: { game: true } });
  if (!lineup) throw new Error('Lineup not found');
  
  const member = await prisma.teamMember.findUnique({
    where: { user_id_team_id: { user_id: BigInt(user.id), team_id: lineup.game.team_id } }
  });
  if (!member || member.role !== 'ADMIN') throw new Error('Forbidden');
  
  await gameService.deleteLineup(lineupId);
  return { success: true };
});
