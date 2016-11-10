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
var userPolls = new Map(); // polls of all users.       userPolls[userid][pollid] = poll
var currPolls = new Map(); // currently being created.  currPolls[userid] = poll


// Matches /start
bot.onText(/\/start/, function(msg, match) {
    matched = true;
    poll = {
        id: msg.message_id,
        owner: msg.from.id,
        question: '',
        choices: []
    };
    currPolls.set(msg.from.id, poll);

    bot.sendMessage(msg.from.id, 'wat question?');
});

// Matches /done
bot.onText(/\/done/, function(msg, match) {
    matched = true;
    var currPoll = currPolls.get(msg.from.id);
    if (currPoll && currPoll.question && currPoll.choices.length) { // currently creating a poll, have question, at least one choices
        currPolls.delete(msg.from.id);
        if (!userPolls.has(msg.from.id)) {
            userPolls.set(msg.from.id, new Map());
        }

        userPolls.get(msg.from.id).set(currPoll.id, currPoll);

        var reply = 'poll created.\n\n';
        reply += '*' + currPoll.question + '*\n\n';
        currPoll.choices.forEach(function(question){
            reply += question + '\n';
        })

        opts = {
            parse_mode: 'Markdown',
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {
                            text: 'share me',
                            switch_inline_query: currPoll.question
                        }
                    ],
                    [
                        {
                            text: 'delete me',
                            callback_data: '/delete ' + currPoll.id
                        }
                    ]
                ]
            })
        }

        bot.sendMessage(msg.from.id, reply, opts);
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

    var currPoll = currPolls.get(msg.from.id);
    if (currPoll) {
        if (!currPoll.question) {
            currPoll.question = match[0];
        } else {
            currPoll.choices.push(match[0]);
        }

        if (currPoll.choices.length == 0) {
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
        polls.forEach(function(poll) {
            if (poll.question.indexOf(msg.query) > -1) {
                text = '*' + poll.question + '*\n\n';
                poll.choices.forEach(function(question){
                    text += question + '\n';
                })

                results.push({
                    type: 'article',
                    id: poll.id.toString(),
                    message_text: text,
                    parse_mode: 'Markdown',
                    title: poll.question,
                    description: poll.choices.toString()
                });
            }
        });
    }
    
    bot.answerInlineQuery(msg.id, results, {
        cache_time: 0,
        switch_pm_text: 'new poll',
        is_personal: true
    });
});

bot.on('callback_query', function(msg) {
    if (msg.data.split(' ')[0] == '/delete') {
        userPolls.get(msg.from.id).delete(parseInt(msg.data.split(' ')[1]));
        bot.sendMessage(msg.from.id, "deleted liao");
    }
});
