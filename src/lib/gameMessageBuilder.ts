import { telegramApi } from './telegramApi';
import { prisma } from './prisma';

export const gameMessageBuilder = {
  buildMessageText(game: any, registrations: any[]) {
    const dateStr = new Date(game.date).toLocaleString('ru-RU', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let text = `⚽ <b>Сбор на игру</b>\n`;
    text += `📅 <b>Дата:</b> ${dateStr}\n`;
    if (game.location) text += `📍 <b>Место:</b> ${game.location}\n`;
    if (game.description) text += `📝 <b>Описание:</b> ${game.description}\n`;
    text += `\n`;

    const going = registrations.filter(r => r.status === 'GOING');
    const notGoing = registrations.filter(r => r.status === 'NOT_GOING');

    text += `✅ <b>Идут (${going.length}):</b>\n`;
    going.forEach((r, i) => {
      const name = r.user.first_name || r.user.username || 'Игрок';
      text += `${i + 1}. ${name}\n`;
    });

    if (notGoing.length > 0) {
      text += `\n❌ <b>Не идут (${notGoing.length}):</b>\n`;
      notGoing.forEach((r, i) => {
        const name = r.user.first_name || r.user.username || 'Игрок';
        text += `${name}\n`;
      });
    }

    return text;
  },

  getInlineKeyboard(gameId: string) {
    return {
      inline_keyboard: [
        [
          { text: '✅ Иду', callback_data: `game_go_${gameId}` },
          { text: '❌ Не иду', callback_data: `game_notgo_${gameId}` }
        ],
        [
          { text: '📱 Открыть приложение', url: `https://t.me/your_bot_username/app?startapp=game_${gameId}` }
        ]
      ]
    };
  },

  async sendGameMessage(teamChatId: bigint, game: any) {
    const text = this.buildMessageText(game, []);
    const markup = this.getInlineKeyboard(game.id);
    const result = await telegramApi.sendMessage(teamChatId, text, markup);
    if (result.ok && result.result?.message_id) {
      // Сохраняем ID сообщения в БД
      await prisma.game.update({
        where: { id: game.id },
        data: { telegram_message_id: BigInt(result.result.message_id) }
      });
    }
  },

  async updateGameMessage(gameId: string) {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      include: {
        team: true,
        registrations: { include: { user: true } }
      }
    });

    if (game && game.telegram_message_id && game.team?.telegram_chat_id) {
      const text = this.buildMessageText(game, game.registrations);
      const markup = this.getInlineKeyboard(game.id);
      await telegramApi.editMessageText(
        game.team.telegram_chat_id,
        game.telegram_message_id,
        text,
        markup
      );
    }
  }
};
