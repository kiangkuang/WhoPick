import { Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { addOption, updateQuestion } from '../repository';
import { WhoPickContext } from '../session';

export const addOptionScene = new Scenes.BaseScene<WhoPickContext>(SceneId.AddOption);

addOptionScene.enter(async (ctx) => ctx.reply('Send me an answer option.'));

addOptionScene.command('done', async (ctx) => {
  await updateQuestion(ctx.session.questionId, {
    isEnabled: true,
  });

  ctx.replyWithHTML('Done! You can now share it to a group or send it to your friends in a private message.\nTo do this, tap the button below or start your message in any other chat with <code>@WhoPickBot</code> and select one of your polls that appear to send.');

  return ctx.scene.enter(SceneId.ShowPoll);
});

addOptionScene.on('text', async (ctx) => {
  const option = await addOption(ctx.session.questionId, ctx.message.text);

  return ctx.replyWithHTML(`Added option:\n<b>${option.option}</b>\n\nNow send me another answer option.\nWhen you've added enough, simply send /done to finish up.`);
});
