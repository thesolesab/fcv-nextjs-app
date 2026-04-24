import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData, getBotToken, getTelegramUserFromInitData } from '@/lib/telegramAuth';
import { userService } from '@/services/userService';

// Helper for validating auth in requests
const requireTelegramAuth = (initData: string | null) => {
  if (!initData) {
    throw new Error('Missing initData');
  }
  const token = getBotToken();
  if (!validateTelegramWebAppData(initData, token)) {
    throw new Error('Invalid Telegram data');
  }
};

// CREATE or UPDATE a user
export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();
    requireTelegramAuth(initData);

    const user = getTelegramUserFromInitData(initData);
    if (!user) {
      return NextResponse.json({ error: 'No user data in initData' }, { status: 400 });
    }

    const savedUser = await userService.upsertUser(user);
    return NextResponse.json({ success: true, user: savedUser });
  } catch (err: any) {
    console.error('Error in POST /api/users:', err);
    const status = err.message.includes('Invalid') ? 401 : err.message.includes('Missing') ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// GET all users
export async function GET(req: NextRequest) {
  try {
    const initData = req.headers.get('x-telegram-init-data');
    requireTelegramAuth(initData);

    const users = await userService.getAllUsers();
    return NextResponse.json({ users });
  } catch (err: any) {
    console.error('Error in GET /api/users:', err);
    const status = err.message.includes('Invalid') ? 401 : err.message.includes('Missing') ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// DELETE a user
export async function DELETE(req: NextRequest) {
  try {
    const { initData, userId } = await req.json();
    requireTelegramAuth(initData);

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    await userService.deleteUser(userId);
    return NextResponse.json({ success: true, deletedId: userId });
  } catch (err: any) {
    console.error('Error in DELETE /api/users:', err);
    const status = err.message.includes('Invalid') ? 401 : err.message.includes('Missing') ? 400 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
