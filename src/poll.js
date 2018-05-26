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

    getChoicesInlineKeyboard(type) {
        const result = this.poll.choices.map(choice => [
            {
                text: choice.choice,
                callback_data: `/${type}Choice ${this.poll.id} ${choice.id}`
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
                        callback_data: `/editChoices ${questionId}`
                    }
                ],
                [
                    {
                        text: "➕ Add options",
                        callback_data: `/addChoices ${questionId}`
                    }
                ],
                [
                    {
                        text: "➖ Remove options",
                        callback_data: `/deleteChoices ${questionId}`
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
        return this.poll.choices.map(choice => choice.choice).join(", ");
    }

    toString() {
        let result = `*${this.poll.question}*`;

        this.poll.choices.forEach(choice => {
            result += `\n\n_${choice.choice}_`;

            choice.votes.forEach((vote, i) => {
                result += `\n    ${i + 1}) ${vote.name}`;
            });
        });

        return result + `\n\n#WhoPick`;
    }
}

function inlineKeyboard(poll) {
    const result = poll.choices.map(choice => [
        {
            text: choice.choice,
            callback_data: `/vote ${poll.id} ${choice.id}`
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
