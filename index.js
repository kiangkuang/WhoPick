require('dotenv').config({silent: process.env.NODE_ENV === 'production'});
if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === '<token>') {
    console.log('ERROR: "BOT_TOKEN" env variable not set.');
    return;
}

var TelegramBot = require('node-telegram-bot-api');

var token = process.env.BOT_TOKEN;
// Setup polling way
var bot = process.env.NODE_ENV === 'production' ?
    new TelegramBot(token, {webHook: {port: process.env.PORT, host: '0.0.0.0'}}):
    new TelegramBot(token, {polling: true});

if (process.env.NODE_ENV === 'production') {
    bot.setWebHook('https://whopick.herokuapp.com/bot' + token);
}

// Matches /echo [whatever]
bot.onText(/\/echo (.+)/, function(msg, match) {
    var resp = match[1];
    bot.sendMessage(msg.chat.id, resp);
});

var matched = false;
var userPolls = new Map();
var wipPolls = new Map();


// Matches /start
bot.onText(/\/start/, function(msg, match) {
    matched = true;
    poll = {
        owner: msg.from.id,
        qn: '',
        ans: []
    };
    wipPolls.set(msg.from.id, poll);

    bot.sendMessage(msg.from.id, 'wat qn?');
});

// Matches /done
bot.onText(/\/done/, function(msg, match) {
    matched = true;
    var wipPoll = wipPolls.get(msg.from.id);
    if (wipPoll && wipPoll.qn && wipPoll.ans.length) {
        wipPolls.delete(msg.from.id);
        if (!userPolls.has(msg.from.id)) {
            userPolls.set(msg.from.id, new Map());
        }

        userPolls.get(msg.from.id).set(msg.message_id, wipPoll);

        bot.sendMessage(msg.from.id, JSON.stringify(wipPoll));
        console.log(userPolls);
    } else {
        bot.sendMessage(msg.from.id, 'wtf u trying to do');
    }
});

// Matches all other
bot.onText(/(.*)/, function(msg, match) {
    if (matched) {
        matched = false;
        return;
    }

    var wipPoll = wipPolls.get(msg.from.id);
    if (wipPoll) {
        if (!wipPoll.qn) {
            wipPoll.qn = match[0];
        } else {
            wipPoll.ans.push(match[0]);
        }

        if (wipPollwipPoll.ans.length == 0) {
            bot.sendMessage(msg.from.id, 'nice one lah. wat choice?');
        } else {
            bot.sendMessage(msg.from.id, 'nice one lah. wat other choice? /done if pang kang');
        }
    }
});

bot.on('inline_query', function(msg) {
    var results = [];

    var polls = userPolls.get(msg.from.id);
    if (polls) {
        polls.forEach(function(poll, id) {
            results.push({
                type: 'article',
                id: id.toString(),
                message_text: 'blahblah',
                title: poll.qn,
                description: poll.ans.toString()
            });
        });
    }
    
    bot.answerInlineQuery(msg.id, results, {
        switch_pm_text: 'new poll',
        is_personal: true
    });
})
