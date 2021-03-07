import { User } from 'telegraf/typings/telegram-types';
import { Question } from './repository/models/Question';

export function getPoll(poll: Question) {
  let result = `${escapeHtml(poll.question, 'b')}`;

  poll.options?.forEach((option) => {
    result += `\n\n${escapeHtml(option.option, 'i')}`;

    option.votes?.forEach((vote, i) => {
      result += `\n    ${i + 1}) ${vote.name}`;
    });
  });

  return `${result}\n\n#WhoPick`;
}

export function escapeHtml(msg: string, tag?: 'b' | 'i') {
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

export function getName(from: User) {
  return (`${from.first_name} ${from.last_name ?? ''}`).trim();
}

export function getDescription(poll: Question) {
  return (poll.options ?? [])
    .map((option) => option.option)
    .join(', ');
}
