import { Markup } from 'telegraf';
import { User } from 'telegraf/typings/telegram-types';
import { Action } from './enum';
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
  if (!poll.isEnabled) {
    return [[Markup.button.callback('✅ Open poll', `${Action.SetQuestion}:${poll.id}:isEnabled:${!poll.isEnabled}`)]];
  }

  const shareText = poll.isShareAllowed
    ? '🔒 Set private (only you can share)'
    : '🔓 Set public (participants can share)';
  return [
    [Markup.button.switchToChat('💬 Share poll', poll.question)],
    [Markup.button.callback('🔄 Refresh', `${Action.RefreshAdmin}:${poll.id}`)],
    [Markup.button.callback(shareText, `${Action.SetQuestion}:${poll.id}:isShareAllowed:${!poll.isShareAllowed}`)],
    [Markup.button.callback('📝 Edit poll', `${Action.Edit}:${poll.id}`)],
    [Markup.button.callback('🚫 Close poll', `${Action.SetQuestion}:${poll.id}:isEnabled:${!poll.isEnabled}`)],
  ];
}

function getQuestionKeyboard(poll: Question) {
  if (!poll.isEnabled) {
    return [[Markup.button.callback('🚫 Poll closed', `${Action.Refresh}:${poll.id}`)]];
  }

  const result = (poll.options ?? []).map((option) => [
    Markup.button.callback(option.option, `${Action.Vote}:${poll.id}:${option.id}`),
  ]);
  result.push([Markup.button.callback('🔄 Refresh', `${Action.Refresh}:${poll.id}`)]);
  return result;
}

export function getKeyboard(poll:Question, isAdmin: boolean) {
  return isAdmin
    ? getAdminKeyboard(poll)
    : getQuestionKeyboard(poll);
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

export function getDescription(poll: Question) {
  return (poll.options ?? [])
    .map((option) => option.option)
    .join(', ');
}

export function getEditMenu(poll:Question) {
  return [
    [Markup.button.callback('❓ Edit question', `${Action.EditQuestion}:${poll.id}`)],
    [Markup.button.callback('🔠 Edit options', `${Action.EditOptionsMenu}:${poll.id}`)],
    [Markup.button.callback('⬅ Back', `${Action.RefreshAdmin}:${poll.id}`)],
  ];
}

export function getEditOptionsMenu(poll:Question) {
  return [
    [Markup.button.callback('➕ Add options', `${Action.AddOptions}:${poll.id}`)],
    [Markup.button.callback('📝 Edit options', `${Action.EditOptions}:${poll.id}`)],
    [Markup.button.callback('➖ Remove options', `${Action.DeleteOptions}:${poll.id}`)],
    [Markup.button.callback('⬅ Back', `${Action.Edit}:${poll.id}`)],
  ];
}

export function getOptionsMenu(poll:Question, type: Action.EditOption | Action.DeleteOption) {
  const result = (poll.options ?? []).map((option) => [
    Markup.button.callback(option.option, `${type}Option:${poll.id}:${option.id}`),
  ]);
  result.push([Markup.button.callback('⬅ Back', `${Action.EditOptionsMenu}:${poll.id}`)]);
  return result;
}
