import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';

export const GET = withTelegramAuth(async (req, user, context) => {
  const teamId = context.params.id;
  const members = await teamService.getMembers(user.id, teamId);
  return { members };
});

export const PATCH = withTelegramAuth(async (req, user, context) => {
  const teamId = context.params.id;
  const { targetUserId, newRole } = await req.json();
  
  if (!targetUserId || !newRole) {
    throw new Error('Missing targetUserId or newRole');
  }

  const updatedMember = await teamService.updateMemberRole(user.id, teamId, targetUserId, newRole);
  return { member: updatedMember };
});
