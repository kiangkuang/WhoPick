import { Question } from './repository/models/Question';

export function toString(poll: Question) {
  let result = `${escapeHtml(poll.question, 'b')}`;

  poll.options?.forEach((option) => {
    result += `\n\n${escapeHtml(option.option, 'i')}`;

    option.votes?.forEach((vote, i) => {
      result += `\n    ${i + 1}) ${vote.name}`;
    });
  });

  return `${result}\n\n#WhoPick`;
}

export function adminKeyboard(poll: Question) {
  return {
    inline_keyboard: [
      [{
        text: '💬 Share poll',
        switch_inline_query: poll.question,
      }],
      [{
        text: '🔄 Refresh',
        callback_data: `/refreshAdmin ${poll.id}`,
      }],
      [{
        text: poll.isShareAllowed
          ? '🔒 Set private (only you can share)'
          : '🔓 Set public (participants can share)',
        callback_data: `/setShareAllowed ${poll.id} ${!poll.isShareAllowed}`,
      }],
      [{
        text: '📝 Edit poll',
        callback_data: `/edit ${poll.id}`,
      }],
      [{
        text: '🚫 Close poll',
        callback_data: `/delete ${poll.id}`,
      }],
    ],
  };
}

function escapeHtml(msg: string, tag?: 'b' | 'i') {
  const result = msg
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  if (tag) {
    return `<${tag}>${result}</${tag}>`;
  }
  return result;
}
