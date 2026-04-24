import { NextResponse } from 'next/server';
import { validateTelegramWebAppData } from '@/lib/telegramAuth';

// Пример получения переменных окружения. В реальном приложении задайте их в .env.local
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { initData } = body;

    // 1. Проверяем валидность initData от Телеграма
    if (!initData) {
      return NextResponse.json({ error: 'No initData provided' }, { status: 400 });
    }

    if (!TELEGRAM_BOT_TOKEN) {
      console.warn("TELEGRAM_BOT_TOKEN is not set in environment variables");
    }

    const isValid = validateTelegramWebAppData(initData, TELEGRAM_BOT_TOKEN);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid Telegram Web App data' }, { status: 401 });
    }

    // Здесь можно доставить user data из строки initData:
    const urlParams = new URLSearchParams(initData);
    const userString = urlParams.get('user');
    const user = userString ? JSON.parse(decodeURIComponent(userString)) : null;

    // 2. Делаем нужные операции с БД
    // Пример интеграции с Supabase будет здесь.
    // const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // const { data, error } = await supabase.from('users').upsert({ telegram_id: user.id, username: user.username });

    return NextResponse.json({ 
      success: true, 
      message: 'Привет от сервера! Данные телеграм валидны.',
      user 
    }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
