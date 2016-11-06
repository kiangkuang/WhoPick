require('dotenv').config({silent: process.env.NODE_ENV === 'production'})
if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === '<token>') {
    console.log('ERROR: "BOT_TOKEN" env variable not set.')
    return
}

var TelegramBot = require('node-telegram-bot-api');

var token = process.env.BOT_TOKEN;
// Setup polling way
var bot = process.env.NODE_ENV === 'production' ?
    new TelegramBot(token, {webhook: {port: process.env.PORT, host: '0.0.0.0'}}):
    new TelegramBot(token, {polling: true});

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function (msg, match) {
  var fromId = msg.from.id;
  var resp = match[1];
  bot.sendMessage(fromId, resp);
});

// Any kind of message
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  // photo can be: a file path, a stream or a Telegram file_id
  var photo = 'cats.png';
  //bot.sendPhoto(chatId, photo, {caption: 'Lovely kittens'});
});
