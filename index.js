var sprintf = require("sprintf-js").sprintf;
require('dotenv').config({
    silent: process.env.NODE_ENV != undefined
});

if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === '<token>' || !process.env.DB_URL || process.env.DB_URL === '<db url>') {
    console.log('ERROR: env variables not set.');
    return;
}

var Sequelize = require('sequelize');
var sequelize = new Sequelize(process.env.DB_URL);
var Question = sequelize.define("question", {
    question: Sequelize.STRING(4096),
    userId: Sequelize.INTEGER,
    name: Sequelize.STRING,
    isEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: 0
    }
});

var Choice = sequelize.define("choice", {
    choice: Sequelize.STRING(4096)
});

var Vote = sequelize.define("vote", {
    userId: Sequelize.INTEGER,
    name: Sequelize.STRING
});

Question.hasMany(Choice);
Choice.hasMany(Vote);

var TelegramBot = require('node-telegram-bot-api');
var isLocal = process.env.NODE_ENV === 'local'
var token = process.env.BOT_TOKEN;

if (isLocal) {
    var bot = new TelegramBot(token, {
        polling: true
    });
} else {
    var bot = new TelegramBot(token, {
        webHook: {
            port: process.env.PORT,
            host: '0.0.0.0'
        }
    });
    bot.setWebHook('https://' + process.env.HEROKU_APP_NAME + '.herokuapp.com/bot' + token);
}

var matched = false;
var questionMap = new Map(); // value -1 = need question, > 0 = need choice
var editingMap = new Map();

// Matches /start
bot.onText(/\/start/, function(msg, match) {
    matched = true;
    start(msg.from.id);
});

// Matches /done
bot.onText(/\/done/, function(msg, match) {
    matched = true;
    done(msg.from.id);
});

// Matches /polls
bot.onText(/\/polls/, function(msg, match) {
    matched = true;
    polls(msg.from.id);
});

// Matches all other
bot.onText(/(.*)/, function(msg, match) {
    if (matched) {
        matched = false;
        return;
    }

    var questionId = questionMap.get(msg.from.id);
    var editingId = editingMap.get(msg.from.id);

    if (editingId) {
        editQuestion(msg.from.id, editingId, match[0]);
        return;
    }

    if (questionId == -1) {
        addQuestion(msg.from.id, msg.from.first_name, match[0]);
    } else if (questionId > 0) {
        addChoice(msg.from.id, questionId, match[0]);
    }
});

bot.on('inline_query', function(msg) {
    inlineQuery(msg.id, msg.from.id, msg.query)
});

bot.on('callback_query', function(msg) {
    var commands = msg.data.split(' ');
    switch (commands[0]) {
        case '/vote': // /vote questionId choiceId
            vote(msg.inline_message_id, msg.from.id, msg.from.first_name, commands[1], commands[2]);
            break;
        case '/update': // /update questionId
            updatePoll(msg.message.chat.id, msg.message.message_id, 0, commands[1], false);
            break;
        case '/delete': // /delete questionId
            deletePoll(msg.message.chat.id, msg.message.message_id, commands[1])
            break;
        case '/edit': // /edit questionId
            startEditingQuestion(msg.from.id, commands[1])
            break;
    }
});

function start(userId) {
    questionMap.set(userId, -1);
    bot.sendMessage(userId, 'Let\'s create a new poll. First, send me the question.');
}

function addQuestion(userId, name, question) {
    Question.create({
        userId: userId,
        name: name,
        question: question
    }).then(function(result) {
        questionMap.set(userId, result.id);
        bot.sendMessage(userId, sprintf('Creating a new poll: \'*%s*\'\n\nPlease send me the first answer option.', question), {
            parse_mode: 'Markdown'
        });
    });
}

function addChoice(userId, questionId, choice) {
    Choice.create({
        questionId: questionId,
        choice: choice
    }).then(function(result) {
        bot.sendMessage(userId, sprintf('Added option: \'*%s*\'\n\nNow send me another answer option.\nWhen you\'ve added enough, simply send /done to finish creating the poll.', choice), {
            parse_mode: 'Markdown'
        });
    });
}

function done(userId) {
    var questionId = questionMap.get(userId);
    if (questionId > 0) { // currently creating a poll
        Question.update({
            isEnabled: 1
        }, {
            where: {
                id: questionId
            }
        }).then(function(result) {
            questionMap.delete(userId);

            Question.findById(questionId, {
                include: [{
                    model: Choice,
                    include: [Vote]
                }]
            }).then(function(poll) {
                opts = {
                    parse_mode: 'Markdown',
                    reply_markup: getAdminInlineKeyboard(poll.question, poll.id)
                }

                var reply = 'Poll created. You can now share it to a group or send it to your friends in a private message. To do this, tap the button below or start your message in any other chat with @WhoPickBot and select one of your polls to send.\n\n';
                bot.sendMessage(userId, reply + formatPoll(poll), opts);
            });
        });
    } else {
        bot.sendMessage(userId, 'wtf u trying to do');
    }
}

function inlineQuery(queryId, userId, query) {
    Question.findAll({
        where: {
            userId: userId,
            question: {
                like: '%' + query + '%'
            },
            isEnabled: 1
        },
        include: [{
            model: Choice,
            include: [Vote]
        }],
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function(polls) {
        var reply = [];
        polls.map(function(poll) {
            reply.push({
                parse_mode: 'Markdown',
                id: poll.id.toString(),
                type: 'article',
                title: poll.question,
                description: getDescription(poll),
                message_text: formatPoll(poll),
                reply_markup: getInlineKeyboard(poll)
            });
        });

        bot.answerInlineQuery(queryId, reply, {
            cache_time: 0,
            switch_pm_text: 'Create new poll',
            is_personal: true
        });
    });
}

function vote(inlineMessageId, userId, name, questionId, choiceId) {
    Question.findById(questionId, {
        include: [{
            model: Choice,
            where: {
                id: choiceId
            },
            include: [{
                model: Vote,
                where: {
                    userId: userId
                },
                required: false
            }]
        }]
    }).then(function(poll) {
        if (poll.isEnabled) {
            if (poll.choices[0].votes.length == 0) {
                Vote.create({
                    choiceId: choiceId,
                    userId: userId,
                    name: name
                }).then(function(result) {
                    updatePoll(0, 0, inlineMessageId, questionId, false);
                });
            } else {
                Vote.destroy({
                    where: {
                        choiceId: choiceId,
                        userId: userId,
                    }
                }).then(function(result) {
                    updatePoll(0, 0, inlineMessageId, questionId, false);
                });
            }
        } else {
            updatePoll(0, 0, inlineMessageId, questionId, true);
        }
    })
}

function updatePoll(chatId, messageId, inlineMessageId, questionId, isClosed) {
    Question.findById(questionId, {
        include: [{
            model: Choice,
            include: [Vote]
        }]
    }).then(function(poll) {
        var opts = {
            parse_mode: 'Markdown',
            reply_markup: isClosed ? getPollClosedInlineKeyboard() : getInlineKeyboard(poll)
        };
        if (chatId) {
            opts.chat_id = chatId;
            opts.message_id = messageId;
            opts.reply_markup = isClosed ? getPollClosedInlineKeyboard() : getAdminInlineKeyboard(poll.question, questionId)
        } else if (inlineMessageId) {
            opts.inline_message_id = inlineMessageId;
            opts.reply_markup = isClosed ? getPollClosedInlineKeyboard() : getInlineKeyboard(poll)
        }

        bot.editMessageText(formatPoll(poll), opts);
    });
}

function startEditingQuestion(userId, questionId) {
    editingMap.set(userId, questionId);
    bot.sendMessage(userId, '*Editing*\nPlease send me the new question.', {
        parse_mode: 'Markdown'
    });
}

function editQuestion(userId, questionId, question) {
    Question.update({
        question: question
    }, {
        where: {
            id: questionId
        }
    }).then(function(result) {
        editingMap.delete(userId);
        bot.sendMessage(userId, sprintf('Poll question edited to \'*%s*\'.\nUpdate or vote on the poll to see the change.', question), {
            parse_mode: 'Markdown'
        });
    });
}

function deletePoll(chatId, messageId, questionId) {
    Question.update({
        isEnabled: 0
    }, {
        where: {
            id: questionId
        }
    }).then(function(result) {
        updatePoll(chatId, messageId, 0, questionId, true);
    });
}

function polls(userId) {
    Question.findAll({
        where: {
            userId: userId,
            isEnabled: 1
        },
        include: [{
            model: Choice,
            include: [Vote]
        }]
    }).then(function(polls) {
        opts = {
            parse_mode: 'Markdown',
            reply_markup: getPollsInlineKeyboard(polls)
        }
        bot.sendMessage(userId, 'Here are your polls:', opts);
    });
}

function formatPoll(poll) {
    result = sprintf('*%s*\n', poll.question);

    poll.choices.forEach(function(choice) {
        result += sprintf('\n_%s_\n', choice.choice);

        choice.votes.forEach(function(vote, i) {
            result += sprintf('%d) %s\n', i + 1, vote.name)
        });
    });
    return result;
}

function getInlineKeyboard(poll) {
    var result = poll.choices.map(function(choice) {
        return [{
            text: choice.choice,
            callback_data: '/vote ' + poll.id + ' ' + choice.id
        }];
    });
    return {
        inline_keyboard: result
    };
}

function getPollsInlineKeyboard(polls) {
    var result = polls.map(function(poll) {
        return [{
            text: poll.question,
            callback_data: '/update ' + poll.id
        }];
    });
    return {
        inline_keyboard: result
    };
}

function getAdminInlineKeyboard(question, questionId) {
    return {
        inline_keyboard: [
            [{
                text: 'Share poll',
                switch_inline_query: question
            }],
            [{
                text: 'Update results',
                callback_data: '/update ' + questionId
            }],
            [{
                text: 'Edit question',
                callback_data: '/edit ' + questionId
            }],
            [{
                text: 'Close poll',
                callback_data: '/delete ' + questionId
            }]
        ]
    };
}

function getPollClosedInlineKeyboard() {
    return {
        inline_keyboard: [
            [{
                text: 'Poll Closed',
                callback_data: '0'
            }]
        ]
    };
}

function getDescription(poll) {
    return poll.choices.map(function(choice) {
        return choice.choice;
    }).join(', ');
}
