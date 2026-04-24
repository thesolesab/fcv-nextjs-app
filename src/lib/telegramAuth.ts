import crypto from 'crypto';
import { TelegramUser } from '@/types/telegram';

/**
 * Получает токен бота из переменных окружения
 */
export function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  return token.trim();
}

/**
 * Валидирует данные, пришедшие от Telegram Web App (initData)
 */
export function validateTelegramWebAppData(initData: string, botToken: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return false;
    
    // Удаляем хэш из параметров для формирования строки проверки
    urlParams.delete('hash');
    
    // Сортируем ключи по алфавиту
    const dataKeys = Array.from(urlParams.keys());
    dataKeys.sort();
    
    // Формируем строку проверки формата "key=value\nkey=value"
    const dataCheckString = dataKeys.map(key => `${key}=${urlParams.get(key)}`).join('\n');
    
    // Генерируем секретный ключ с использованием HMAC-SHA256
    const cleanToken = botToken.trim();
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(cleanToken).digest();
    
    // Хэшируем строку проверки с секретным ключом
    const _hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    // Сравниваем полученный хэш с тем, что прислал Telegram
    const isValid = _hash === hash;
    if (!isValid) {
      console.log('--- Telegram Validation Failed ---');
      console.log('initData:', initData);
      console.log('botToken:', cleanToken.substring(0, 5) + '***');
      console.log('dataCheckString:\n' + dataCheckString);
      console.log('Expected hash:', hash);
      console.log('Calculated hash:', _hash);
      console.log('----------------------------------');
    }
    return isValid;
  } catch (err) {
    console.error('Ошибка валидации Telegram data:', err);
    return false;
  }
}

/**
 * Извлекает данные пользователя (JSON) из initData
 */
export function getTelegramUserFromInitData(initData: string): TelegramUser | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userStr = urlParams.get('user');
    if (!userStr) return null;
    return JSON.parse(userStr) as TelegramUser;
  } catch (err) {
    console.error('Error parsing user from initData', err);
    return null;
  }
}
