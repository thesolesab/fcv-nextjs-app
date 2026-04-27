import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { gameService } from '@/services/gameService';
import { gameMessageBuilder } from '@/lib/gameMessageBuilder';

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
      const { chat, new_chat_member, from } = update.my_chat_member;

      // Проверяем, что это группа/супергруппа и статус 'member' или 'administrator'
      if ((chat.type === 'group' || chat.type === 'supergroup') && 
          (new_chat_member.status === 'member' || new_chat_member.status === 'administrator')) {
        
        // 1. Сохраняем пользователя, который добавил бота
        if (from && !from.is_bot) {
          await prisma.user.upsert({
            where: { id: BigInt(from.id) },
            update: {
              username: from.username || null,
              first_name: from.first_name || null,
              last_name: from.last_name || null,
            },
            create: {
              id: BigInt(from.id),
              username: from.username || null,
              first_name: from.first_name || null,
              last_name: from.last_name || null,
            }
          });
        }

        // 2. Создаем или обновляем команду с ID этого чата
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

        // 3. Связываем пользователя (from) с командой как ADMIN
        if (from && !from.is_bot) {
          await prisma.teamMember.upsert({
            where: {
              user_id_team_id: {
                user_id: BigInt(from.id),
                team_id: team.id
              }
            },
            update: {
              role: 'ADMIN' // Повышаем до админа, если он уже был
            },
            create: {
              user_id: BigInt(from.id),
              team_id: team.id,
              role: 'ADMIN'
            }
          });
          console.log(`[Webhook] User ${from.id} assigned as ADMIN to Team ${team.id}`);
        }

        console.log(`[Webhook] Team created/updated for chat ${chat.id}: ${team.name} (Team UUID: ${team.id})`);
      }
    }

    // Сценарий 3: Нажатие на Inline кнопку
    if (update.callback_query) {
      const query = update.callback_query;
      const data = query.data; // "game_go_123" или "game_notgo_123"
      const from = query.from;

      if (data && data.startsWith('game_') && from) {
        // Убедимся, что юзер есть в БД
        await prisma.user.upsert({
          where: { id: BigInt(from.id) },
          update: {
            username: from.username || null,
            first_name: from.first_name || null,
            last_name: from.last_name || null,
          },
          create: {
            id: BigInt(from.id),
            username: from.username || null,
            first_name: from.first_name || null,
            last_name: from.last_name || null,
          }
        });

        const parts = data.split('_');
        if (parts.length >= 3) {
          const action = parts[1]; // 'go' или 'notgo'
          const gameId = parts.slice(2).join('_'); // id может содержать дефисы (UUID)
          const status = action === 'go' ? 'GOING' : 'NOT_GOING';

          // Регистрируем
          await gameService.registerForGame(gameId, from.id, status as any);

          // Обновляем сообщение в группе
          await gameMessageBuilder.updateGameMessage(gameId);

          // Отвечаем Telegram, чтобы убрать индикатор загрузки на кнопке
          const token = process.env.TELEGRAM_BOT_TOKEN;
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callback_query_id: query.id, text: 'Голос учтен!' })
          });
        }
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
