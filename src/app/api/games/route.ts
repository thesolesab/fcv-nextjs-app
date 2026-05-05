import { withTelegramAuth } from '@/lib/api-handler';
import { gameService } from '@/services/gameService';

export const GET = withTelegramAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  
  if (!teamId) throw new Error('Missing teamId');

  const games = await gameService.getUpcomingGames(teamId);
  return { games };
});

export const DELETE = withTelegramAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');
  const teamId = searchParams.get('teamId');
  
  if (!gameId || !teamId) throw new Error('Missing gameId or teamId');

  // Убедимся, что пользователь является админом команды
  const teamMember = await import('@/lib/prisma').then(m => m.prisma.teamMember.findUnique({
    where: { user_id_team_id: { user_id: BigInt(user.id), team_id: teamId } }
  }));

  if (!teamMember || teamMember.role !== 'ADMIN') {
    throw new Error('Access denied');
  }

  await gameService.deleteGame(gameId, teamId);
  return { success: true };
});
