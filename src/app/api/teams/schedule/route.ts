import { withTelegramAuth } from '@/lib/api-handler';
import { teamService } from '@/services/teamService';

export const GET = withTelegramAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get('teamId');
  if (!teamId) throw new Error('Missing teamId');

  const schedules = await teamService.getSchedules(teamId);
  return { schedules };
});

export const POST = withTelegramAuth(async (req, user) => {
  const { teamId, dayOfWeek, time, location } = await req.json();
  const schedule = await teamService.createSchedule(user.id, teamId, Number(dayOfWeek), time, location);
  return { success: true, schedule };
});

export const DELETE = withTelegramAuth(async (req, user) => {
  const { scheduleId, teamId } = await req.json();
  await teamService.deleteSchedule(user.id, teamId, scheduleId);
  return { success: true };
});
