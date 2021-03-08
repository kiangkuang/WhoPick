import { Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { updateQuestion } from '../repository';
import { WhoPickContext } from '../context';

export const editQuestionScene = new Scenes.BaseScene<WhoPickContext>(SceneId.EditQuestion);

editQuestionScene.enter(async (ctx) => ctx.replyWithHTML('<b>Editing question</b>\nPlease send me the new question.'));

editQuestionScene.command('done', (ctx) => ctx.scene.leave());

editQuestionScene.on('text', async (ctx) => {
  await updateQuestion(ctx.session.questionId, {
    question: ctx.message.text,
  });

  return ctx.scene.enter(SceneId.ShowPoll);
});
