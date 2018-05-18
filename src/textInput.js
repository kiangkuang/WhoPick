import Machina from "machina";
import Repo from "./repository";
import Poll from "./poll";

export default class TextInput {
    constructor(bot) {
        this.clients = [];
        this.sm = new Machina.BehavioralFsm({
            namespace: "textInput",
            initialState: "none",

            states: {
                none: {
                    "/start": function(client) {
                        this.transition(client, "addQuestion");
                    },
                    "/addChoice": function(client) {
                        this.transition(client, "addChoice");
                    },
                    "/polls": function(client) {
                        this.transition(client, "polls");
                    },
                    "/editQuestion": function(client) {
                        this.transition(client, "editQuestion");
                    },
                    "/editChoice": function(client) {
                        this.transition(client, "editChoice");
                    },
                    "*": function(client) {
                        bot.sendMessage(
                            client.userId,
                            "Sorry I didn't get what you mean. Try sending /start to create a new poll!"
                        );
                    }
                },
                addQuestion: {
                    _onEnter: function(client) {
                        bot.sendMessage(
                            client.userId,
                            "Let's create a new poll. First, send me the question."
                        );
                    },
                    "*": function(client, msg) {
                        if (client.addingQuestion === true) {
                            return;
                        }
                        client.addingQuestion = true;

                        Repo.addQuestion(client.userId, client.name, msg).then(
                            result => {
                                client.addingQuestion = false;
                                client.questionId = result.id;

                                bot.sendMessage(
                                    client.userId,
                                    `Creating a new poll:\n*${msg}*\n\nNext, send me the first answer choice.`,
                                    {
                                        parse_mode: "Markdown"
                                    }
                                );

                                this.transition(client, "addChoice");
                            }
                        );
                    }
                },
                addChoice: {
                    "*": function(client, msg) {
                        Repo.addChoice(client.questionId, msg).then(() => {
                            bot.sendMessage(
                                client.userId,
                                `Added choice:\n*${msg}*\n\nNow send me another answer choice.\nWhen you've added enough, simply send /done to finish up.`,
                                {
                                    parse_mode: "Markdown"
                                }
                            );
                        });
                    },
                    "/done": function(client) {
                        Repo.updateQuestion(client.questionId, {
                            isEnabled: 1
                        }).then(() => {
                            bot.sendMessage(
                                client.userId,
                                "Done! You can now share it to a group or send it to your friends in a private message. To do this, tap the button below or start your message in any other chat with `@WhoPickBot` and select one of your polls that appear to send.",
                                {
                                    parse_mode: "Markdown"
                                }
                            );

                            this.transition(client, "showPoll");
                        });
                    }
                },
                polls: {
                    _onEnter: function(client) {
                        Repo.getQuestions({
                            userId: client.userId,
                            isEnabled: 1
                        }).then(polls => {
                            const opts = {
                                parse_mode: "Markdown",
                                reply_markup: new Poll(
                                    polls
                                ).getPollsInlineKeyboard()
                            };
                            bot.sendMessage(
                                client.userId,
                                "Here are your polls:",
                                opts
                            );
                        });
                    }
                },
                editQuestion: {
                    _onEnter: function(client) {
                        bot.sendMessage(
                            client.userId,
                            "*Editing question*\nPlease send me the new question.",
                            {
                                parse_mode: "Markdown"
                            }
                        );
                    },
                    "*": function(client, msg) {
                        Repo.updateQuestion(client.questionId, {
                            question: msg
                        }).then(() => {
                            this.transition(client, "showPoll");
                        });
                    }
                },
                editChoice: {
                    _onEnter: function(client) {
                        bot.sendMessage(
                            client.userId,
                            "*Editing option*\nPlease send me the new option.",
                            {
                                parse_mode: "Markdown"
                            }
                        );
                    },
                    "*": function(client, msg) {
                        Repo.updateChoice(client.choiceId, {
                            choice: msg
                        }).then(() => {
                            this.transition(client, "showPoll");
                        });
                    }
                },
                showPoll: {
                    _onEnter: function(client) {
                        Repo.getQuestion(client.questionId).then(question => {
                            const poll = new Poll(question);
                            const opts = {
                                parse_mode: "Markdown",
                                reply_markup: poll.getPollInlineKeyboard(true)
                            };

                            bot.sendMessage(
                                client.userId,
                                poll.toString(),
                                opts
                            );

                            this.transition(client, "none");
                        });
                    }
                }
            }
        });
    }

    parse(userId, name, msg) {
        if (this.clients[userId] === undefined) {
            this.clients[userId] = {
                userId: userId,
                name: name
            };
        }

        this.sm.handle(this.clients[userId], msg);
    }

    editQuestion(userId, questionId) {
        if (this.clients[userId] === undefined) {
            this.clients[userId] = {
                userId: userId
            };
        }
        this.clients[userId].questionId = questionId;

        this.sm.handle(this.clients[userId], "/editQuestion");
    }

    editChoice(userId, questionId, choiceId) {
        if (this.clients[userId] === undefined) {
            this.clients[userId] = {
                userId: userId
            };
        }
        this.clients[userId].questionId = questionId;
        this.clients[userId].choiceId = choiceId;

        this.sm.handle(this.clients[userId], "/editChoice");
    }
}
