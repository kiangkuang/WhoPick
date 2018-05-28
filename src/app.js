import TelegramBot from "node-telegram-bot-api";
import Repo from "./repository";
import Poll from "./poll";
import TextInput from "./textInput";

if (
    !process.env.BOT_TOKEN ||
    process.env.BOT_TOKEN === "<token>" ||
    !process.env.DB_URL ||
    process.env.DB_URL === "<db url>"
) {
    throw "ERROR: env variables not set.";
}
const isLocal = process.env.NODE_ENV === "local";
const token = process.env.BOT_TOKEN;
const port = process.env.PORT;
const herokuAppName = process.env.HEROKU_APP_NAME;

let bot;
if (isLocal) {
    bot = new TelegramBot(token, {
        polling: {
            timeout: 2
        }
    });
} else {
    bot = new TelegramBot(token, {
        webHook: {
            port: port,
            host: "0.0.0.0"
        }
    });
    bot.setWebHook(`https://${herokuAppName}.herokuapp.com/bot${token}`);
}

const textInput = new TextInput(bot);

// Matches all
bot.onText(/(.*)/, msg => {
    textInput.parse(msg.from.id, formatName(msg.from), msg.text);
});

bot.on("callback_query", msg => {
    const params = msg.data.split(" ");
    switch (params[0]) {
        case "/vote": // /vote questionId choiceId
            vote(msg, params[1], params[2]);
            break;

        case "/refreshAdmin": // /refreshAdmin questionId
            refresh(msg, params[1], true);
            break;
        case "/refresh": // /refresh questionId
            refresh(msg, params[1], false);
            break;

        case "/delete": // /delete questionId
            remove(msg, params[1]);
            break;

        case "/edit": // /edit questionId
            editMenu(msg, params[1]);
            break;
        case "/editChoices": // /editChoices questionId
            editChoicesMenu(msg, params[1], "edit");
            break;
        case "/deleteChoices": // /deleteChoices questionId
            editChoicesMenu(msg, params[1], "delete");
            break;

        case "/editQuestion": // /editQuestion questionId
            textInput.editQuestion(msg.from.id, params[1]);
            break;
        case "/editChoice": // /editChoice questionId choiceId
            textInput.editChoice(msg.from.id, params[1], params[2]);
            break;

        case "/addChoices": // /addChoices questionId
            textInput.addChoice(msg.from.id, params[1]);
            break;

        case "/deleteChoice": // /deleteChoice questionId choiceId
            deleteChoice(msg, params[1], params[2]);
            break;
    }
});

function vote(msg, questionId, choiceId) {
    Repo.getQuestion(questionId).then(poll => {
        if (poll.isEnabled) {
            Repo.addVote(choiceId, msg.from.id, formatName(msg.from))
                .catch(() => {
                    Repo.removeVote(choiceId, msg.from.id);
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

function editChoicesMenu(msg, questionId, editType) {
    Repo.getQuestion(questionId).then(question => {
        const opts = {
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        };
        bot.editMessageReplyMarkup(
            new Poll(question).getChoicesInlineKeyboard(editType),
            opts
        );
    });
}

function deleteChoice(msg, questionId, choiceId) {
    Repo.removeChoice(choiceId).then(() => {
        refresh(msg, questionId, true);
    });
}

bot.on("inline_query", msg => {
    Repo.getQuestions({
        userId: msg.from.id,
        question: {
            like: `%${msg.query}%`
        },
        isEnabled: 1
    }).then(questions => {
        const reply = [];
        questions.map(question => {
            const poll = new Poll(question);
            reply.push({
                type: "article",
                parse_mode: "Markdown",
                disable_web_page_preview: true,
                id: question.id.toString(),
                title: question.question,
                description: poll.getDescription(),
                message_text: poll.toString(),
                reply_markup: poll.getPollInlineKeyboard(false)
            });
        });
        bot.answerInlineQuery(msg.id, reply, {
            cache_time: 0,
            switch_pm_text: "Create new poll",
            switch_pm_parameter: "inlineQuery",
            is_personal: true
        });
    });
});

function getRefreshOpts(msg, poll, isAdmin) {
    const opts = {
        parse_mode: "Markdown",
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
