import { withTelegramAuth } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const PATCH = withTelegramAuth(async (req, user, context: any) => {
  const params = await context.params;
  const gameId = params.id;
  const { lineupId, score } = await req.json();

  if (!lineupId) throw new Error('Missing lineupId');
  if (score === undefined || score === null) throw new Error('Missing score');

  // Любой авторизованный пользователь может обновлять счет (по просьбе клиента)
  const lineup = await prisma.gameLineup.update({
    where: { id: lineupId },
    data: { score: Number(score) }
  });

  return { lineup };
});
