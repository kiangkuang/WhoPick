import Repo from "./repository";
import Poll from "./poll";
import TelegramBot from "node-telegram-bot-api";
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

const newQuestionMap = new Map(); // value == -1 = need question, > 0 = need choice
const editQuestionMap = new Map();
const editChoiceMap = new Map();

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

const ti = new TextInput(bot);

// Matches all
bot.onText(/(.*)/, msg => {
    ti.parse(msg.from.id, formatName(msg.from), msg.text);
});

bot.on("callback_query", msg => {
    const commands = msg.data.split(" ");
    switch (commands[0]) {
        case "/vote": // /vote questionId choiceId
            vote(commands[1], commands[2], msg);
            break;

        case "/refreshAdmin": // /refreshAdmin questionId
            refreshAdmin(commands[1], msg);
            break;
        case "/refresh": // /refresh questionId
            refresh(commands[1], msg);
            break;

        case "/delete": // /delete questionId
            remove(commands[1], msg);
            break;

        case "/edit": // /edit questionId
            editMenu(commands[1], msg);
            break;
        case "/editChoices": // /editChoices questionId
            editChoicesMenu(commands[1], msg, "edit");
            break;
        case "/deleteChoices": // /deleteChoices questionId
            editChoicesMenu(commands[1], msg, "delete");
            break;

        case "/editQuestion": // /editQuestion questionId
            ti.editQuestion(msg.from.id, commands[1]);
            break;
        case "/editChoice": // /editChoice questionId choiceId
            ti.editChoice(msg.from.id, commands[1], commands[2]);
            break;

        case "/addChoices": // /addChoices questionId
            addChoices(commands[1], msg);
            break;

        case "/deleteChoice": // /deleteChoice questionId choiceId
            deleteChoice(commands[1], commands[2], msg);
            break;
    }
});

function vote(questionId, choiceId, msg) {
    Repo.getQuestion(questionId).then(poll => {
        if (poll.isEnabled) {
            Repo.addVote(choiceId, msg.from.id, formatName(msg.from))
                .catch(() => {
                    Repo.removeVote(choiceId, msg.from.id);
                })
                .finally(() => {
                    refresh(questionId, msg);
                });
        } else {
            refresh(questionId, msg);
        }
    });
}

function refreshAdmin(questionId, msg) {
    Repo.getQuestion(questionId).then(question => {
        const poll = new Poll(question);
        const opts = {
            parse_mode: "Markdown",
            reply_markup: poll.getPollInlineKeyboard(true),
            chat_id: msg.message.chat.id,
            message_id: msg.message.message_id
        };
        bot.editMessageText(poll.toString(), opts);
    });
}

function refresh(questionId, msg) {
    Repo.getQuestion(questionId).then(question => {
        const poll = new Poll(question);
        const opts = {
            parse_mode: "Markdown",
            reply_markup: poll.getPollInlineKeyboard(),
            inline_message_id: msg.inline_message_id
        };
        bot.editMessageText(poll.toString(), opts);
    });
}

function remove(questionId, msg) {
    Repo.updateQuestion(questionId, { isEnabled: 0 }).then(() => {
        Repo.getQuestion(questionId).then(question => {
            const poll = new Poll(question);
            const opts = {
                parse_mode: "Markdown",
                reply_markup: poll.getPollInlineKeyboard(true),
                chat_id: msg.message.chat.id,
                message_id: msg.message.message_id
            };
            bot.editMessageText(poll.toString(), opts);
        });
    });
}

function editMenu(questionId, msg) {
    const opts = {
        chat_id: msg.message.chat.id,
        message_id: msg.message.message_id
    };
    bot.editMessageReplyMarkup(Poll.getEditKeyboard(questionId), opts);
}

function editChoicesMenu(questionId, msg, editType) {
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

function addChoices(questionId, msg) {
    //todo
    bot.sendMessage(
        msg.from.id,
        "*Adding options*\nPlease send me the new option.",
        {
            parse_mode: "Markdown"
        }
    );
}

function deleteChoice(questionId, choiceId, msg) {
    Repo.removeChoice(choiceId).then(() => {
        refreshAdmin(questionId, msg);
    });
}

bot.on("inline_query", msg => {
    inlineQuery(msg.id, msg.from.id, msg.query);
});

function inlineQuery(queryId, userId, query) {
    Repo.getQuestions({
        userId: userId,
        question: {
            like: `%${query}%`
        },
        isEnabled: 1
    }).then(questions => {
        const reply = [];
        questions.map(question => {
            const poll = new Poll(question);
            reply.push({
                parse_mode: "Markdown",
                id: question.id.toString(),
                type: "article",
                title: question.question,
                description: poll.getDescription(),
                message_text: poll.toString(),
                reply_markup: poll.getPollInlineKeyboard()
            });
        });

        bot.answerInlineQuery(queryId, reply, {
            cache_time: 0,
            switch_pm_text: "Create new poll",
            switch_pm_parameter: "x",
            is_personal: true
        });
    });
}

function formatName(from) {
    if (from.last_name) {
        return `${from.first_name} ${from.last_name}`;
    }
    return from.first_name;
}
