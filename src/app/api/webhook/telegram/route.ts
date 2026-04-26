import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Сценарий 1: Пользователь отправляет команду /start в личку боту
    if (update.message && update.message.text?.startsWith('/start')) {
      const tgUser = update.message.from;
      
      if (tgUser && !tgUser.is_bot) {
        // Сохраняем пользователя в БД
        await prisma.user.upsert({
          where: { id: BigInt(tgUser.id) },
          update: {
            username: tgUser.username || null,
            first_name: tgUser.first_name || null,
            last_name: tgUser.last_name || null,
          },
          create: {
            id: BigInt(tgUser.id),
            username: tgUser.username || null,
            first_name: tgUser.first_name || null,
            last_name: tgUser.last_name || null,
          }
        });
        
        console.log(`[Webhook] User ${tgUser.id} registered via /start`);
      }
    }

    // Сценарий 2: Бота добавили в группу
    if (update.my_chat_member) {
      const { chat, new_chat_member } = update.my_chat_member;

      // Проверяем, что это группа/супергруппа и статус 'member' или 'administrator'
      if ((chat.type === 'group' || chat.type === 'supergroup') && 
          (new_chat_member.status === 'member' || new_chat_member.status === 'administrator')) {
        
        // Создаем или обновляем команду с ID этого чата
        const team = await prisma.team.upsert({
          where: { telegram_chat_id: BigInt(chat.id) },
          update: {
            name: chat.title || 'Новая команда'
          },
          create: {
            telegram_chat_id: BigInt(chat.id),
            name: chat.title || 'Новая команда'
          }
        });

        console.log(`[Webhook] Team created/updated for chat ${chat.id}: ${team.name} (Team UUID: ${team.id})`);
      }
    }

    // Telegram всегда ждет 200 OK, иначе будет повторять запрос
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Webhook] Error processing update:', error);
    // Все равно возвращаем 200, чтобы Telegram не спамил ретраями из-за наших внутренних ошибок
    return NextResponse.json({ ok: true });
  }
}
