import { NextRequest, NextResponse } from 'next/server';
import { validateTelegramWebAppData } from '@/utils/telegramAuth';
import { supabaseAdmin } from '@/utils/supabase';

// Helper to validate request and get bot token
const getBotToken = () => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return token;
};

// CREATE or UPDATE a user
export async function POST(req: NextRequest) {
  try {
    const { initData } = await req.json();

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData' }, { status: 400 });
    }

    const token = getBotToken();
    const isValid = validateTelegramWebAppData(initData, token);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 401 });
    }

    // Extract user payload from initData
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    
    if (!userStr) {
      return NextResponse.json({ error: 'No user data in initData' }, { status: 400 });
    }

    const user = JSON.parse(userStr);

    // Upsert into Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: user.id,
        username: user.username || null,
        first_name: user.first_name || null,
        last_name: user.last_name || null,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error('Error in POST /api/users:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET all users
export async function GET(req: NextRequest) {
  try {
    // Note: For a GET request, we might pass initData in the query or headers
    const initData = req.headers.get('x-telegram-init-data');

    if (!initData) {
      return NextResponse.json({ error: 'Missing initData in headers' }, { status: 400 });
    }

    const token = getBotToken();
    const isValid = validateTelegramWebAppData(initData, token);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ users: data });
  } catch (err: any) {
    console.error('Error in GET /api/users:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a user
export async function DELETE(req: NextRequest) {
  try {
    const { initData, userId } = await req.json();

    if (!initData || !userId) {
      return NextResponse.json({ error: 'Missing initData or userId' }, { status: 400 });
    }

    const token = getBotToken();
    const isValid = validateTelegramWebAppData(initData, token);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Telegram data' }, { status: 401 });
    }

    // Optionally check if the user requesting delete is an admin, or just allow it for this demo
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: userId });
  } catch (err: any) {
    console.error('Error in DELETE /api/users:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
