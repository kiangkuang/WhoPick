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
        reply += formatPoll(poll);

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
            currPoll.choices.push(
                {
                    text: match[0],
                    voters: []
                }
            );
        }

        if (currPoll.choices.length == 0) {
            bot.sendMessage(msg.from.id, 'nice one lah. wat first choice?');
        } else {
            bot.sendMessage(msg.from.id, 'nice one lah. wat other choice?\n/done if pang kang');
        }
    }
});

bot.on('inline_query', function(msg) {
    var polls = userPolls.get(msg.from.id);
    if (polls) {
        var results = [];

        polls.forEach(function(poll) {
            if (poll.question.indexOf(msg.query) > -1) {
                var inlineKeyboard = poll.choices.map(function(choice, i) {
                    return [{text: choice.text, callback_data: '/vote ' + msg.from.id + ' ' + poll.id + ' ' + i}];
                });
                var description = poll.choices.map(function(choice) {
                    return choice.text;
                });

                results.push({
                    type: 'article',
                    id: poll.id.toString(),
                    message_text: formatPoll(poll),
                    parse_mode: 'Markdown',
                    title: poll.question,
                    description: description.toString(),
                    reply_markup: {
                        inline_keyboard: inlineKeyboard
                    }
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
    var commands = msg.data.split(' ');
    switch (commands[0]) {
        case '/delete':
            userPolls.get(msg.from.id).delete(parseInt(commands[1]));
            bot.sendMessage(msg.from.id, "deleted liao");
            break;
        case '/vote': // /vote userid pollid choiceIndex
            var poll = userPolls.get(parseInt(commands[1])).get(parseInt(commands[2]));
            poll.choices[commands[3]].voters.push(msg.from.first_name);
            console.log(poll)
            console.log(poll.choices)
            break;
    }
});

function formatPoll(poll) {
    text = '*' + poll.question + '*\n';
    poll.choices.forEach(function(choice) {
        text += '_' + choice.text + '_\n';

        choice.voters.forEach(function(voter, i) {
            text += (i + 1) + ') ' + voter + '\n';
        });
    });

    return text;
}
