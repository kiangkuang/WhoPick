import { Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { getName } from '../formatter';
import { addQuestion } from '../repository';
import { WhoPickContext } from '../session';

export const addQuestionScene = new Scenes.BaseScene<WhoPickContext>(SceneId.AddQuestion);

addQuestionScene.enter(async (ctx) => ctx.reply('Let\'s create a new poll. First, send me the question.'));

addQuestionScene.command('done', (ctx) => ctx.scene.leave());

addQuestionScene.on('text', async (ctx) => {
  const question = await addQuestion(ctx.from.id, getName(ctx.from), ctx.message.text);
  ctx.session.questionId = question.id;

  ctx.replyWithHTML(`Creating a new poll:\n<b>${ctx.message.text}</b>`);

  return ctx.scene.enter(SceneId.AddOption);
});
