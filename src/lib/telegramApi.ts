export const telegramApi = {
  async getMe() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    
    const url = `https://api.telegram.org/bot${token}/getMe`;
    const res = await fetch(url);
    return res.json();
  },

  async sendMessage(chatId: string | number | bigint, text: string, replyMarkup?: any) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.toString(),
        text,
        reply_markup: replyMarkup,
        parse_mode: 'HTML'
      })
    });
    return res.json();
  },

  async editMessageText(chatId: string | number | bigint, messageId: string | number | bigint, text: string, replyMarkup?: any) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not defined');

    const url = `https://api.telegram.org/bot${token}/editMessageText`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.toString(),
        message_id: messageId.toString(),
        text,
        reply_markup: replyMarkup,
        parse_mode: 'HTML'
      })
    });
    return res.json();
  }
};
