import { withTelegramAuth } from '@/lib/api-handler';
import { prisma } from '@/lib/prisma';

export const GET = withTelegramAuth(async (req, user) => {
  const dbUser = await prisma.user.findUnique({
    where: { id: BigInt(user.id) }
  });
  
  if (!dbUser) {
    throw new Error('User not found');
  }

  return { user: dbUser };
});

export const PATCH = withTelegramAuth(async (req, user) => {
  const body = await req.json();
  const { first_name, last_name, position, phone } = body;

  const updatedUser = await prisma.user.update({
    where: { id: BigInt(user.id) },
    data: {
      first_name,
      last_name,
      position,
      phone
    }
  });

  return { user: updatedUser };
});
