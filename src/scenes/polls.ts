import { Markup, Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { getPollsKeyboard } from '../keyboard';
import { getQuestions } from '../repository';
import { WhoPickContext } from '../session';

export const pollsScene = new Scenes.BaseScene<WhoPickContext>(SceneId.Polls);

pollsScene.enter(async (ctx) => {
  const questions = await getQuestions({
    userId: ctx.from?.id,
    isEnabled: 1,
  });

  ctx.replyWithHTML('Here are your polls:', {
    ...Markup.inlineKeyboard(getPollsKeyboard(questions)),
    disable_web_page_preview: true,
  });

  return ctx.scene.leave();
});
