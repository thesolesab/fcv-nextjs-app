import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';

export const GET = withTelegramAuth(async (req, user, context: { params: Promise<{ id: string }> }) => {
  const params = await context.params;
  const team = await teamService.getTeamById(user.id, params.id);
  return { team };
});
