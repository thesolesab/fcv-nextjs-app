import { withTelegramAuth } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  
  const game = await prisma.game.findUnique({
    where: { id: gameId }
  });

  return { game };
});
