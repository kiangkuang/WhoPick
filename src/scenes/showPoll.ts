import { Markup, Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { getKeyboard, toString } from '../formatter';
import { getQuestion } from '../repository';
import { WhoPickContext } from '../session';

export const showPollScene = new Scenes.BaseScene<WhoPickContext>(SceneId.ShowPoll);

showPollScene.enter(async (ctx) => {
  const question = await getQuestion(ctx.session.questionId);
  if (!question) {
    throw new Error('question is null');
  }

  ctx.replyWithHTML(toString(question), {
    ...Markup.inlineKeyboard(getKeyboard(question, true)),
    disable_web_page_preview: true,
  });

  return ctx.scene.leave();
});
