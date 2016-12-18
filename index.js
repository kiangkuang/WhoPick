require('dotenv').config({
    silent: process.env.NODE_ENV != undefined
});

if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === '<token>' || !process.env.DB_URL || process.env.DB_URL === '<db url>') {
    console.log('ERROR: env variables not set.');
    return;
}

var sprintf = require("sprintf-js").sprintf;
var models = require('./models');
var TelegramBot = require('node-telegram-bot-api');
var isLocal = process.env.NODE_ENV === 'local'
var token = process.env.BOT_TOKEN;
var newQuestionMap = new Map(); // value == -1 = need question, > 0 = need choice
var editQuestionMap = new Map();
var editChoiceMap = new Map();

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

// Matches all
bot.onText(/(.*)/, function(msg, match) {
    switch (match[0].split(' ')[0]) {
        case '/start':
            start(msg.from.id);
            return;
        case '/done':
            done(msg.from.id);
            return;
        case '/polls':
            polls(msg.from.id);
            return;
        default:
            textInput(msg.from.id, msg.from.first_name, match[0]);
            return;
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
            deletePoll(msg.message.chat.id, msg.message.message_id, commands[1]);
            break;
        case '/edit': // /edit questionId
            edit(msg.message.chat.id, msg.message.message_id, commands[1]);
            break;

        case '/editQuestion': // /editQuestion questionId
            startEditingQuestion(msg.from.id, commands[1])
            break;

        case '/addChoices': // /addChoices questionId
            startAddingChoices(msg.from.id, commands[1])
            break;

        case '/editChoices': // /editChoices questionId
            listChoices(msg.message.chat.id, msg.message.message_id, commands[1], 'edit');
            break;
        case '/editChoice': // /editChoice questionId choiceId
            startEditingChoice(msg.from.id, commands[1], commands[2]);
            break;

        case '/deleteChoices': // /deleteChoices questionId
            listChoices(msg.message.chat.id, msg.message.message_id, commands[1], 'delete');
            break;
        case '/deleteChoice': // /deleteChoice questionId choiceId
            deleteChoice(msg.message.chat.id, msg.message.message_id, commands[1], commands[2]);
            break;
    }
});

function start(userId) {
    newQuestionMap.set(userId, -1);
    bot.sendMessage(userId, 'Let\'s create a new poll. First, send me the question.');
}

function textInput(userId, name, text) {
    var questionId = newQuestionMap.get(userId);
    if (questionId == -1) {
        addQuestion(userId, name, text);
        return;
    }
    if (questionId > 0) {
        addChoice(userId, questionId, text);
        return;
    }

    questionId = editQuestionMap.get(userId);
    if (questionId) {
        editQuestion(userId, questionId, text);
        return;
    }

    var choiceId = editChoiceMap.get(userId).choiceId;
    if (choiceId) {
        editChoice(userId, choiceId, text);
        return;
    }
}

function addQuestion(userId, name, question) {
    models.question.create({
        userId: userId,
        name: name,
        question: question
    }).then(function(result) {
        newQuestionMap.set(userId, result.id);
        bot.sendMessage(userId, sprintf('Creating a new poll: \'*%s*\'\n\nPlease send me the first answer option.', question), {
            parse_mode: 'Markdown'
        });
    });
}

function addChoice(userId, questionId, choice) {
    models.choice.create({
        questionId: questionId,
        choice: choice
    }).then(function(result) {
        bot.sendMessage(userId, sprintf('Added option: \'*%s*\'\n\nNow send me another answer option.\nWhen you\'ve added enough, simply send /done to finish up.', choice), {
            parse_mode: 'Markdown'
        });
    });
}

function done(userId) {
    var questionId = newQuestionMap.get(userId) || editQuestionMap.get(userId) || editChoiceMap.get(userId).questionId;
    if (questionId > 0) { // currently creating a poll
        models.question.update({
            isEnabled: 1
        }, {
            where: {
                id: questionId
            }
        }).then(function(result) {
            newQuestionMap.delete(userId);
            editQuestionMap.delete(userId);
            editChoiceMap.delete(userId);

            models.question.findById(questionId, {
                include: [{
                    model: models.choice,
                    include: [models.vote]
                }]
            }).then(function(poll) {
                opts = {
                    parse_mode: 'Markdown',
                    reply_markup: getAdminInlineKeyboard(poll.question, poll.id)
                }

                var reply = 'Done. You can now share it to a group or send it to your friends in a private message. To do this, tap the button below or start your message in any other chat with @WhoPickBot and select one of your polls to send.\n\n';
                bot.sendMessage(userId, reply + formatPoll(poll), opts);
            });
        });
    } else {
        bot.sendMessage(userId, 'Try typing /start first to create a poll.');
    }
}

function inlineQuery(queryId, userId, query) {
    models.question.findAll({
        where: {
            userId: userId,
            question: {
                like: '%' + query + '%'
            },
            isEnabled: 1
        },
        include: [{
            model: models.choice,
            include: [models.vote]
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
    models.question.findById(questionId, {
        include: [{
            model: models.choice,
            where: {
                id: choiceId
            },
            include: [{
                model: models.vote,
                where: {
                    userId: userId
                },
                required: false
            }]
        }]
    }).then(function(poll) {
        if (poll.isEnabled) {
            if (poll.choices[0].votes.length == 0) {
                models.vote.create({
                    choiceId: choiceId,
                    userId: userId,
                    name: name
                }).then(function(result) {
                    updatePoll(0, 0, inlineMessageId, questionId, false);
                });
            } else {
                models.vote.destroy({
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
    models.question.findById(questionId, {
        include: [{
            model: models.choice,
            include: [models.vote]
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

function edit(chatId, messageId, questionId) {
    var opts = {
        chat_id: chatId,
        message_id: messageId
    };
    bot.editMessageReplyMarkup(getEditKeyboard(questionId), opts);
}

function listChoices(chatId, messageId, questionId, type) {
    console.log(type);
    models.choice.findAll({
        where: {
            questionId: questionId
        }
    }).then(function(choices) {
        var opts = {
            chat_id: chatId,
            message_id: messageId
        }
        bot.editMessageReplyMarkup(getListChoicesKeyboard(questionId, choices, type), opts);
    });
}

function startEditingQuestion(userId, questionId) {
    editQuestionMap.set(userId, questionId);
    bot.sendMessage(userId, '*Editing question*\nPlease send me the new question.', {
        parse_mode: 'Markdown'
    });
}

function startAddingChoices(userId, questionId) {
    newQuestionMap.set(userId, questionId);
    bot.sendMessage(userId, '*Adding options*\nPlease send me the new option.', {
        parse_mode: 'Markdown'
    });
}

function startEditingChoice(userId, questionId, choiceId) {
    editChoiceMap.set(userId, {
        questionId,
        choiceId
    });
    bot.sendMessage(userId, '*Editing option*\nPlease send me the new option.', {
        parse_mode: 'Markdown'
    });
}

function editQuestion(userId, questionId, question) {
    models.question.update({
        question: question
    }, {
        where: {
            id: questionId
        }
    }).then(function(result) {
        done(userId);
    });
}

function editChoice(userId, choiceId, choice) {
    models.choice.update({
        choice: choice
    }, {
        where: {
            id: choiceId
        }
    }).then(function(result) {
        done(userId);
    });
}

function deleteChoice(chatId, messageId, questionId, choiceId) {
    models.choice.destroy({
        where: {
            id: choiceId
        }
    }).then(function() {
        updatePoll(chatId, messageId, 0, questionId, false);
    });
}

function deletePoll(chatId, messageId, questionId) {
    models.question.update({
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
    models.question.findAll({
        where: {
            userId: userId,
            isEnabled: 1
        },
        include: [{
            model: models.choice,
            include: [models.vote]
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
                text: 'Edit poll',
                callback_data: '/edit ' + questionId
            }],
            [{
                text: 'Close poll',
                callback_data: '/delete ' + questionId
            }]
        ]
    };
}

function getEditKeyboard(questionId) {
    return {
        inline_keyboard: [
            [{
                text: 'Edit question',
                callback_data: '/editQuestion ' + questionId
            }],
            [{
                text: 'Add options',
                callback_data: '/addChoices ' + questionId
            }],
            [{
                text: 'Edit option',
                callback_data: '/editChoices ' + questionId
            }],
            [{
                text: 'Remove option',
                callback_data: '/deleteChoices ' + questionId
            }],
            [{
                text: 'Back',
                callback_data: '/update ' + questionId
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

function getListChoicesKeyboard(questionId, choices, type) {
    var result = choices.map(function(choice) {
        return [{
            text: choice.choice,
            callback_data: sprintf('/%sChoice %d %d', type, questionId, choice.id)
        }];
    });

    result.push([{
        text: 'Back',
        callback_data: '/update ' + questionId
    }]);

    return {
        inline_keyboard: result
    };
}

function getDescription(poll) {
    return poll.choices.map(function(choice) {
        return choice.choice;
    }).join(', ');
}
