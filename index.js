require('dotenv').config({silent: process.env.NODE_ENV === 'production'})
if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === '<token>') {
    console.log('ERROR: "BOT_TOKEN" env variable not set.')
    return
}

var TelegramBot = require('node-telegram-bot-api');

var token = process.env.BOT_TOKEN;
// Setup polling way
var bot = process.env.NODE_ENV === 'production' ?
    new TelegramBot(token, {webHook: {port: process.env.PORT, host: '0.0.0.0'}}):
    new TelegramBot(token, {polling: true});

if (process.env.NODE_ENV === 'production') {
    bot.setWebHook('https://whopick.herokuapp.com/bot' + token)
}

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function(msg, match) {
    var resp = match[1];
    bot.sendMessage(msg.chat.id, resp);
});

var qn = [];
var opts = {
    reply_markup: JSON.stringify({
        force_reply: true
    })
};

// Matches /start
bot.onText(/\/start/, function(msg, match) {
    qn = []
    bot.sendMessage(msg.chat.id, 'wat qn?', opts)
        .then(function(sent) {
            bot.onReplyToMessage(sent.chat.id, sent.message_id, function(message) {
                qn.push(message.text)
                getChoice(msg, qn);
            });
        });
});

function getChoice(msg, qn) {
    bot.sendMessage(msg.chat.id, 'wat choice? /done if done', opts)
        .then(function(sent) {
            bot.onReplyToMessage(sent.chat.id, sent.message_id, function(message) {
                if (message.text != "/done") {
                    qn.push(message.text)
                    getChoice(msg, qn)
                }
            });
        });
}

// Matches /start [whatever]
bot.onText(/\/start (.+)/, function(msg, match) {
    qn = []
    qn.push(match[1])
    getChoice(msg, qn);
});

// Matches /done
bot.onText(/\/done/, function(msg, match) {
    bot.sendMessage(msg.chat.id, qn.toString());
});
