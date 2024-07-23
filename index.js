const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/puerta/, async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Abrir puerta', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Abrir puerta', callback_data: 'open' }
                ]
            ]
        }
    });
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    if (callbackQuery.data === 'open') {
        const originalMessage = callbackQuery.message;
        const message = await bot.sendMessage(chatId, 'Solicitando apertura de puerta...');
        try {
            const result = await openDoor();
            console.log(result);
            if (result == 'Success') {
                //delete original message
                bot.deleteMessage(chatId, originalMessage.message_id);
                bot.editMessageText('Apertura de puerta exitosa', { chat_id: chatId, message_id: message.message_id });
                bot.answerCallbackQuery(callbackQuery.id);
            } else {
                bot.editMessageText('Error al abrir la puerta', { chat_id: chatId, message_id: message.message_id });
            }
        } catch (error) {
            console.error(error);
            bot.editMessageText('Error al abrir la puerta', { chat_id: chatId, message_id: message.message_id });
        }
    }
});

async function openDoor() {
    console.log('Opening door');
    try {
        const response = await axios.post('https://access-core.lerolero.com.ec/api/sendAccessRequest');
        return "Success";
    } catch (error) {
        console.error(error);
        throw new Error('Error');
    }
}
