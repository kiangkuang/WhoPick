import { Markup, Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { getPoll } from '../formatter';
import { getKeyboard } from '../keyboard';
import { getQuestion } from '../repository';
import { WhoPickContext } from '../session';

export const showPollScene = new Scenes.BaseScene<WhoPickContext>(SceneId.ShowPoll);

showPollScene.enter(async (ctx) => {
  const question = await getQuestion(ctx.session.questionId);

  ctx.replyWithHTML(getPoll(question!), {
    ...Markup.inlineKeyboard(getKeyboard(question!, true)),
    disable_web_page_preview: true,
  });

  return ctx.scene.leave();
});
