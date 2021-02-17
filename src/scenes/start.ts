import { Scenes } from 'telegraf';
import { addQuestion } from '../repository';

export const startSceneId = 'start';
export const startScene = new Scenes.BaseScene<Scenes.SceneContext>(startSceneId);

startScene.enter((ctx) => ctx.reply('Let\'s create a new poll. First, send me the question.'));

startScene.on('text', (ctx) => {
  if (!ctx.from) {
    throw new Error('ctx.from undefined');
  }

  addQuestion(ctx.from.id, ctx.from.first_name, ctx.message.text);

  return ctx.replyWithMarkdown(`Creating a new poll:\n*${ctx.message.text}*\n\nSend me an answer option.`);
});

startScene.command('done', (ctx) => ctx.scene.leave());
