import { Middleware } from 'telegraf';
import { WhoPickContext } from './context';

export const backwardsCompatibleMiddleware: Middleware<WhoPickContext> = (ctx, next) => {
  if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    if (ctx.callbackQuery.data.startsWith('/')) {
      ctx.callbackQuery.data = ctx.callbackQuery.data
        .replace('/', '')
        .replace(/ /g, ':');
    }
  }

  return next();
};
