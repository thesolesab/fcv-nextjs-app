import { telegramApi } from './src/lib/telegramApi.js';

async function test() {
  const chatId = process.env.TEST_CHAT_ID || '-100123456789'; // Dummy
  console.log('Testing sendMessage...');
  const result = await telegramApi.sendMessage(chatId, 'Test message', {
    inline_keyboard: [
      [
        { text: '✅ Иду', callback_data: `game_go_123` }
      ],
      [
        { text: '📱 Открыть приложение', url: `https://t.me/fcv_app_bot/app?startapp=game_123` }
      ]
    ]
  });
  console.log('Result:', result);
}

test();
