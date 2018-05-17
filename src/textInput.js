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
                    "/editQuestion": function(client) {
                        this.transition(client, "editQuestion");
                    },
                    "/editChoice": function(client) {
                        this.transition(client, "editChoice");
                    },
                    "*": function(client, msg) {
                        console.log(msg);
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
                editQuestion: {
                    _onEnter: function(client) {
                        console.log("send edit qn instruction");
                    },
                    "*": function(client, msg) {
                        console.log("qn " + msg + " edited\n");
                        this.transition(client, "showPoll");
                    }
                },
                editChoice: {
                    _onEnter: function(client) {
                        console.log("send edit choice instruction");
                    },
                    "*": function(client, msg) {
                        console.log("choice " + msg + " edited\n");
                        this.transition(client, "showPoll");
                    }
                },
                showPoll: {
                    _onEnter: function(client) {
                        Repo.getQuestion(client.questionId).then(question => {
                            const poll = new Poll(question);
                            const opts = {
                                parse_mode: "Markdown",
                                reply_markup: poll.getInlineKeyboard(true)
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
}
