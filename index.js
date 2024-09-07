const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/puerta/, async (msg) => {
    const chatId = msg.chat.id;
    //get doors list
    const doors = await getDoors();
    inline_keyboard = doors.map(door => {
        return [{ text: door.name, callback_data: `open ${door.id}` }];
    });
    bot.sendMessage(chatId, 'Abrir puerta', {
        reply_markup: {
            inline_keyboard: inline_keyboard
        }
    });
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    if (callbackQuery.data.includes('open')) {
        const originalMessage = callbackQuery.message;
        const message = await bot.sendMessage(chatId, 'Solicitando apertura de puerta...');
        try {
            door_id = callbackQuery.data.split(' ')[1];
            const result = await openDoor(door_id);
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
// Function to open the door, query to the API on /api/sendAccessRequest
async function openDoor(door_id) {
    console.log('Opening door');
    try {
        const response = await axios.post('https://access-core.lerolero.com.ec/api/createAccessRequest', {
            door_id: door_id
        }
        );
        return "Success";
    } catch (error) {
        console.error(error);
        throw new Error('Error');
    }
}

async function getDoors() {
    try {
        const response = await axios.get('https://access-core.lerolero.com.ec/api/doors');
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Error');
    }
}