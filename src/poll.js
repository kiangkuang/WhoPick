import isUrl from "is-url";

export default class Poll {
    constructor(poll) {
        if (Array.isArray(poll)) {
            this.polls = poll;
        } else {
            this.poll = poll;
        }
    }

    getPollInlineKeyboard(isAdmin) {
        if (this.poll.isEnabled) {
            return isAdmin
                ? inlineKeyboardAdmin(this.poll)
                : inlineKeyboard(this.poll);
        }
        return inlineKeyboardClosed();
    }

    getPollsInlineKeyboard() {
        const result = this.polls.map(poll => [
            {
                text: poll.question,
                callback_data: `/refreshAdmin ${poll.id}`
            }
        ]);
        return {
            inline_keyboard: result
        };
    }

    getOptionsInlineKeyboard(type) {
        const result = this.poll.options.map(option => [
            {
                text: option.option,
                callback_data: `/${type}Option ${this.poll.id} ${option.id}`
            }
        ]);

        result.push([
            {
                text: "⬅ Back",
                callback_data: "/refreshAdmin " + this.poll.id
            }
        ]);

        return {
            inline_keyboard: result
        };
    }

    static getEditKeyboard(questionId) {
        return {
            inline_keyboard: [
                [
                    {
                        text: "📝 Edit question",
                        callback_data: `/editQuestion ${questionId}`
                    }
                ],
                [
                    {
                        text: "📝 Edit options",
                        callback_data: `/editOptions ${questionId}`
                    }
                ],
                [
                    {
                        text: "➕ Add options",
                        callback_data: `/addOptions ${questionId}`
                    }
                ],
                [
                    {
                        text: "➖ Remove options",
                        callback_data: `/deleteOptions ${questionId}`
                    }
                ],
                [
                    {
                        text: "⬅ Back",
                        callback_data: `/refreshAdmin ${questionId}`
                    }
                ]
            ]
        };
    }

    getDescription() {
        return this.poll.options.map(option => option.option).join(", ");
    }

    toString() {
        let result = `${markdownFormat(this.poll.question, "b")}`;

        this.poll.options.forEach(option => {
            result += `\n\n${markdownFormat(option.option, "i")}`;

            option.votes.forEach((vote, i) => {
                result += `\n    ${i + 1}) ${vote.name}`;
            });
        });

        return result + `\n\n#WhoPick`;
    }
}

function inlineKeyboard(poll) {
    const result = poll.options.map(option => [
        {
            text: option.option,
            callback_data: `/vote ${poll.id} ${option.id}`
        }
    ]);
    result.push([
        {
            text: "🔄 Refresh",
            callback_data: `/refresh ${poll.id}`
        }
    ]);
    return {
        inline_keyboard: result
    };
}

function inlineKeyboardAdmin(poll) {
    return {
        inline_keyboard: [
            [
                {
                    text: "💬 Share poll",
                    switch_inline_query: poll.question
                }
            ],
            [
                {
                    text: poll.isShareAllowed
                        ? "🔒 Make private (only you can share)"
                        : "🔓 Make public (participants can share)",
                    callback_data: `/setShareAllowed ${
                        poll.id
                    } ${!poll.isShareAllowed}`
                }
            ],
            [
                {
                    text: "🔄 Refresh",
                    callback_data: `/refreshAdmin ${poll.id}`
                }
            ],
            [
                {
                    text: "📝 Edit poll",
                    callback_data: `/edit ${poll.id}`
                }
            ],
            [
                {
                    text: "🚫 Close poll",
                    callback_data: `/delete ${poll.id}`
                }
            ]
        ]
    };
}

function inlineKeyboardClosed() {
    return {
        inline_keyboard: [
            [
                {
                    text: "🚫 Poll Closed",
                    callback_data: "0"
                }
            ]
        ]
    };
}

function markdownFormat(msg, format) {
    const lines = msg.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const words = lines[i].split(" ");
        for (let j = 0; j < words.length; j++) {
            words[j] = words[j]
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
            words[j] = `<${format}>${words[j]}</${format}>`;
        }
        lines[i] = words.join(" ");
    }
    return lines.join("\n");
}
