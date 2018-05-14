export default class Poll {
    constructor(poll) {
        this.poll = poll;
    }

    getInlineKeyboard(isAdmin = false) {
        if (this.poll.isEnabled) {
            return isAdmin
                ? inlineKeyboardAdmin(this.poll)
                : inlineKeyboard(this.poll);
        }
        return inlineKeyboardClosed();
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
