import crypto from 'crypto';

/**
 * Валидирует данные, пришедшие от Telegram Web App (initData)
 * @param initData строка initData из Telegram Web App
 * @param botToken токен вашего бота из BotFather
 * @returns true если данные подлинные, иначе false
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
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    
    // Хэшируем строку проверки с секретным ключом
    const _hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    // Сравниваем полученный хэш с тем, что прислал Telegram
    return _hash === hash;
  } catch (err) {
    console.error('Ошибка валидации Telegram data:', err);
    return false;
  }
}
