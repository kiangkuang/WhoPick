import { Middleware } from 'telegraf';
import { WhoPickContext } from './context';
import { Action } from './enum';
import { Question } from './repository/models/Question';

const isShareAllowed: keyof Question = 'isShareAllowed';
const isEnabled: keyof Question = 'isEnabled';

export const backwardsCompatibleMiddleware: Middleware<WhoPickContext> = (ctx, next) => {
  if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    if (ctx.callbackQuery.data.startsWith('/setShareAllowed')) {
      const [, questionId, isAllowShare] = ctx.callbackQuery.data.split(' ');
      ctx.callbackQuery.data = `${Action.SetQuestion}:${questionId}:${isShareAllowed}:${isAllowShare === '1'}`;
    }

    if (ctx.callbackQuery.data.startsWith('/delete')) {
      const [, questionId] = ctx.callbackQuery.data.split(' ');
      ctx.callbackQuery.data = `${Action.SetQuestion}:${questionId}:${isEnabled}:${false}`;
    }

    if (ctx.callbackQuery.data.startsWith('/')) {
      ctx.callbackQuery.data = ctx.callbackQuery.data
        .replace('/', '')
        .replace(/ /g, ':');
    }
  }

  return next();
};
