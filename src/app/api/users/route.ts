import { withTelegramAuth } from '@/lib/api-handler';
import { userService } from '@/services/userService';

// CREATE or UPDATE a user
export const POST = withTelegramAuth(async (req, user) => {
  const savedUser = await userService.upsertUser(user);
  return { success: true, user: savedUser };
});

// GET all users
export const GET = withTelegramAuth(async () => {
  const users = await userService.getAllUsers();
  return { users };
});

// DELETE a user
export const DELETE = withTelegramAuth(async (req) => {
  const { userId } = await req.json();
  if (!userId) throw new Error('Missing userId');
  
  await userService.deleteUser(userId);
  return { success: true, deletedId: userId };
});
