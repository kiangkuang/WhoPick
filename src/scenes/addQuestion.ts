import { Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { getName } from '../formatter';
import { addQuestion } from '../repository';
import { StartContext, WhoPickContext } from '../context';

export const addQuestionScene = new Scenes.BaseScene<WhoPickContext>(SceneId.AddQuestion);

addQuestionScene.enter(async (ctx: WhoPickContext | StartContext) => {
  if ('startPayload' in ctx && ctx.startPayload !== '_') {
    return add(ctx, ctx.startPayload);
  }

  return ctx.reply('Let\'s create a new poll. First, send me the question.');
});

addQuestionScene.command('done', (ctx) => ctx.scene.leave());

addQuestionScene.on('text', async (ctx) => add(ctx, ctx.message.text));

async function add(ctx: WhoPickContext, text: string) {
  const question = await addQuestion(ctx.from!.id, getName(ctx.from!), text);
  ctx.session.questionId = question.id;

  ctx.replyWithHTML(`Creating a new poll:\n<b>${text}</b>`);

  return ctx.scene.enter(SceneId.AddOption);
}
