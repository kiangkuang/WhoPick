import { Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { addQuestion } from '../repository';
import { WhoPickContext } from '../session';

export const startScene = new Scenes.BaseScene<WhoPickContext>(SceneId.Start);

startScene.enter((ctx) => ctx.reply('Let\'s create a new poll. First, send me the question.'));

startScene.command('done', (ctx) => ctx.scene.leave());

startScene.on('text', async (ctx) => {
  if (!ctx.from) {
    throw new Error('ctx.from undefined');
  }

  const question = await addQuestion(ctx.from.id, ctx.from.first_name, ctx.message.text);
  ctx.session.questionId = question.id;

  ctx.replyWithHTML(`Creating a new poll:\n<b>${ctx.message.text}</b>`);

  return ctx.scene.enter(SceneId.AddOption);
});
