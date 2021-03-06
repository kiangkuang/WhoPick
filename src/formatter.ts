import { Markup } from 'telegraf';
import { User } from 'telegraf/typings/telegram-types';
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

function getAdminKeyboard(poll: Question) {
  const shareText = poll.isShareAllowed ? '🔒 Set private (only you can share)' : '🔓 Set public (participants can share)';
  return [
    [Markup.button.switchToChat('💬 Share poll', poll.question)],
    [Markup.button.callback('🔄 Refresh', `refreshAdmin:${poll.id}`)],
    [Markup.button.callback(shareText, `setShareAllowed:${poll.id}:${!poll.isShareAllowed}`)],
    [Markup.button.callback('📝 Edit poll', `edit:${poll.id}`)],
    [Markup.button.callback('🚫 Close poll', `delete:${poll.id}`)],
  ];
}

function getQuestionKeyboard(poll: Question) {
  const result = (poll.options || []).map((option) => [
    Markup.button.callback(option.option, `vote:${poll.id}:${option.id}`),
  ]);
  result?.push([Markup.button.callback('🔄 Refresh', `refresh:${poll.id}`)]);
  return result;
}

function getDisabledKeyboard() {
  return [
    [Markup.button.callback('🚫 Poll Closed', '0')],
  ];
}

export function getKeyboard(poll:Question, isAdmin: boolean) {
  if (poll.isEnabled) {
    return isAdmin
      ? getAdminKeyboard(poll)
      : getQuestionKeyboard(poll);
  }
  return getDisabledKeyboard();
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

export function formatName(from: User) {
  return (`${from.first_name} ${from.last_name ?? ''}`).trim();
}
