import { Context, Scenes, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/typings/telegram-types';

interface WhoPickSession extends Scenes.SceneSession {
  questionId: number
  optionId: number
}

export interface WhoPickContext extends Context {
  session: WhoPickSession
  scene: Scenes.SceneContextScene<WhoPickContext>
}

export type ActionContext = NarrowedContext<WhoPickContext & {
  match: RegExpExecArray;
}, Update.CallbackQueryUpdate>;

export type InlineQueryContext = NarrowedContext<WhoPickContext, Update.InlineQueryUpdate>;

export type CommandContext = NarrowedContext<WhoPickContext & {
  match: RegExpExecArray;
}, {
  message: Update.New & Update.NonChannel & Message.TextMessage;
  update_id: number;
}>;

export type StartContext = WhoPickContext & {
  startPayload: string;
};
