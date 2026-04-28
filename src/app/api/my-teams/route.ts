import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';

export const GET = withTelegramAuth(async (req, user) => {
  const teams = await teamService.getMyTeams(user.id);
  return { teams };
});
