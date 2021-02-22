import { Markup } from 'telegraf';
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

export function getAdminKeyboard(poll: Question) {
  const shareText = poll.isShareAllowed ? '🔒 Set private (only you can share)' : '🔓 Set public (participants can share)';
  return [
    [Markup.button.switchToChat('💬 Share poll', poll.question)],
    [Markup.button.callback('🔄 Refresh', `refreshAdmin:${poll.id}`)],
    [Markup.button.callback(shareText, `setShareAllowed:${poll.id}:${!poll.isShareAllowed}`)],
    [Markup.button.callback('📝 Edit poll', `edit:${poll.id}`)],
    [Markup.button.callback('🚫 Close poll', `delete:${poll.id}`)],
  ];
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
