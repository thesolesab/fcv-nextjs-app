import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';

export const POST = withTelegramAuth(async (req, user) => {
  const { teamId } = await req.json();
  if (!teamId) throw new Error('Missing teamId');

  const teamMember = await teamService.joinTeam(user, teamId);
  return { success: true, teamMember };
});
