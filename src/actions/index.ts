import { NarrowedContext } from 'telegraf';
import { Update } from 'telegraf/typings/telegram-types';
import { WhoPickContext } from '../session';

export type ActionContext = NarrowedContext<WhoPickContext & {
  match: RegExpExecArray;
}, Update.CallbackQueryUpdate>;

export type InlineQueryContext = NarrowedContext<WhoPickContext, Update.InlineQueryUpdate>;
