import { NextRequest, NextResponse } from 'next/server';
import { gameService } from '@/services/gameService';

export const dynamic = 'force-dynamic';

// Разрешаем только авторизованные cron-запросы от Vercel
export async function GET(req: NextRequest) {
  // В Vercel есть специальный заголовок, который можно проверять для безопасности:
  // if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

  try {
    const createdCount = await gameService.generateMissingGames();
    return NextResponse.json({ success: true, createdGames: createdCount });
  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
