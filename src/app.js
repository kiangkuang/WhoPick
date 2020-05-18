import TelegramBot from "node-telegram-bot-api";
import Repo from "./repository";
import Poll from "./poll";
import TextInput from "./textInput";

const bot = initBot();
const textInput = new TextInput(bot);

// Matches all
bot.onText(/(.*)/, msg => {
    textInput.parse(msg.from.id, formatName(msg.from), msg.text);
});

bot.on("callback_query", msg => {
    const params = msg.data.split(" ");
    switch (params[0]) {
        case "/vote": // /vote questionId optionId
            vote(msg, params[1], params[2]);
            break;

        case "/refreshAdmin": // /refreshAdmin questionId
            refresh(msg, params[1], true);
            break;

        case "/refresh": // /refresh questionId
            refresh(msg, params[1], false);
            break;

        case "/setShareAllowed":
            // /setIsShareAllowed questionId isAllowShare
            setIsShareAllowed(msg, params[1], params[2]);
            break;

        case "/delete": // /delete questionId
            remove(msg, params[1]);
            break;

        case "/edit": // /edit questionId
            editMenu(msg, params[1]);
            break;

        case "/editOptions": // /editOptions questionId
            editOptionsMenu(msg, params[1], "edit");
            break;

        case "/deleteOptions": // /deleteOptions questionId
            editOptionsMenu(msg, params[1], "delete");
            break;

        case "/editQuestion": // /editQuestion questionId
            textInput.editQuestion(msg.from.id, params[1]);
            break;

        case "/editOption": // /editOption questionId optionId
            textInput.editOption(msg.from.id, params[1], params[2]);
            break;

        case "/addOptions": // /addOptions questionId
            textInput.addOption(msg.from.id, params[1]);
            break;

        case "/deleteOption": // /deleteOption questionId optionId
            deleteOption(msg, params[1], params[2]);
            break;
    }
});

function vote(msg, questionId, optionId) {
    Repo.getQuestion(questionId).then(poll => {
        if (poll.isEnabled) {
            Repo.addVote(optionId, msg.from.id, formatName(msg.from))
                .catch(() => {
                    Repo.removeVote(optionId, msg.from.id);
                })
                .finally(() => {
                    refresh(msg, questionId, false);
                });
        } else {
            refresh(msg, questionId, false);
        }
    });
}

function refresh(msg, questionId, isAdmin) {
    Repo.getQuestion(questionId).then(question => {
        const poll = new Poll(question);
        const opts = getRefreshOpts(msg, poll, isAdmin);
        bot.editMessageText(poll.toString(), opts);
        bot.answerCallbackQuery(msg.id, {
            text: "Poll updated!"
        });
    });
}

function setIsShareAllowed(msg, questionId, isShareAllowed) {
    Repo.updateQuestion(questionId, {
        isShareAllowed: isShareAllowed
    }).then(() => {
        refresh(msg, questionId, true);
    });
}

function remove(msg, questionId) {
    Repo.updateQuestion(questionId, { isEnabled: 0 }).then(() => {
        refresh(msg, questionId, true);
    });
}

function editMenu(msg, questionId) {
    const opts = {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id
    };
    bot.editMessageReplyMarkup(Poll.getEditKeyboard(questionId), opts);
}

function editOptionsMenu(msg, questionId, editType) {
    Repo.getQuestion(questionId).then(question => {
        const opts = {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        };
        bot.editMessageReplyMarkup(
            new Poll(question).getOptionsInlineKeyboard(editType),
            opts
        );
    });
}

function deleteOption(msg, questionId, optionId) {
    Repo.removeOption(optionId).then(() => {
        refresh(msg, questionId, true);
    });
}

bot.on("inline_query", msg => {
    Repo.getQuestions({
        question: {
            like: `%${msg.query}%`
        },
        isEnabled: 1,
        isShareAllowed: 1,
        "$options.votes.userId$": msg.from.id
    }).then(participatedQuestions => {
        Promise.all([
            Repo.getQuestions({
                question: {
                    like: `%${msg.query}%`
                },
                isEnabled: 1,
                userId: msg.from.id
            }),
            Repo.getQuestions({
                id: {
                    $in: participatedQuestions.map(question => question.id)
                }
            })
        ]).then(q => {
            var questions = []
                .concat(...q)
                .filter(
                    (q, i, self) => self.findIndex(x => x.id === q.id) === i
                )
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, 10);

            const reply = [];
            questions.map(question => {
                const poll = new Poll(question);
                reply.push({
                    type: "article",
                    id: question.id.toString(),
                    title: question.question,
                    description: poll.getDescription(),
                    input_message_content: {
                        message_text: poll.toString(),
                        parse_mode: "HTML",
                        disable_web_page_preview: true
                    },
                    reply_markup: poll.getPollInlineKeyboard(false)
                });
            });
            bot.answerInlineQuery(msg.id, reply, {
                cache_time: 0,
                is_personal: true,
                switch_pm_text: "Create new poll",
                switch_pm_parameter: "inlineQuery"
            });
        });
    });
});

function getRefreshOpts(msg, poll, isAdmin) {
    const opts = {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: poll.getPollInlineKeyboard(isAdmin)
    };

    if (isAdmin) {
        opts.chat_id = msg.message.chat.id;
        opts.message_id = msg.message.message_id;
    } else {
        opts.inline_message_id = msg.inline_message_id;
    }

    return opts;
}

function formatName(from) {
    if (from.last_name) {
        return `${from.first_name} ${from.last_name}`;
    }
    return from.first_name;
}

function initBot() {
    const token = process.env.BOT_TOKEN;

    if (!token) {
        throw "ERROR: env variables not set.";
    }

    if (process.env.NODE_ENV === "local") {
        return new TelegramBot(token, {
            polling: {
                params: { timeout: 2 }
            }
        });
    }
    const bot = new TelegramBot(token, {
        webHook: {
            port: process.env.PORT,
            host: "0.0.0.0"
        }
    });
    bot.setWebHook(
        `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/bot${token}`
    );
    return bot;
}
