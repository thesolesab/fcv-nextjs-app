import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is missing' }, { status: 500 });
    }

    // Определяем базовый URL приложения (например, https://my-app.vercel.app)
    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    const webhookUrl = `${baseUrl}/api/webhook/telegram`;

    // Вызываем Telegram API для установки вебхука
    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}&allowed_updates=["message", "my_chat_member"]`);
    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Webhook successfully set', 
        webhookUrl 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: data.description 
      }, { status: 400 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
