const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.onText(/\/puerta/, async (msg) => {
    const chatId = msg.chat.id;
    //get devices list
    const devices = await getDevices();
    inline_keyboard = devices.map(device => {
        return [{ text: device.name, callback_data: `open ${device.id}` }];
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
            device_id = callbackQuery.data.split(' ')[1];
            const result = await openDoor(device_id);
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
async function openDoor(device_id) {
    console.log('Opening door');
    try {
        const response = await axios.post('https://access-core.lerolero.com.ec/api/sendAccessRequest', {
            device_id: device_id
        }
        );
        return "Success";
    } catch (error) {
        console.error(error);
        throw new Error('Error');
    }
}

//Function to get devices list, query to the API on /api/devices
async function getDevices() {
    try {
        const response = await axios.get('https://access-core.lerolero.com.ec/api/devices');
        return response.data;
    } catch (error) {
        console.error(error);
        throw new Error('Error');
    }
}
