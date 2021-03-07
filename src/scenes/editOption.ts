import { Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { updateOption } from '../repository';
import { WhoPickContext } from '../session';

export const editOptionScene = new Scenes.BaseScene<WhoPickContext>(SceneId.EditOption);

editOptionScene.enter(async (ctx) => ctx.replyWithHTML('<b>Editing option</b>\nPlease send me the new option.'));

editOptionScene.command('done', (ctx) => ctx.scene.leave());

editOptionScene.on('text', async (ctx) => {
  await updateOption(ctx.session.optionId, {
    option: ctx.message.text,
  });

  return ctx.scene.enter(SceneId.ShowPoll);
});
