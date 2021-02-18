import { Scenes } from 'telegraf';
import { addOption, updateQuestion } from '../repository';
import { WhoPickContext } from '../session';

export const addOptionSceneId = 'addOption';
export const addOptionScene = new Scenes.BaseScene<WhoPickContext>(addOptionSceneId);

addOptionScene.enter((ctx) => ctx.reply('Send me an answer option.'));

addOptionScene.command('done', async (ctx) => {
  if (!ctx.session.questionId) {
    throw new Error('ctx.scene.session.questionId undefined');
  }

  await updateQuestion(ctx.session.questionId, {
    isEnabled: true,
  });

  ctx.replyWithHTML('Done! You can now share it to a group or send it to your friends in a private message.\nTo do this, tap the button below or start your message in any other chat with <code>@WhoPickBot</code> and select one of your polls that appear to send.');

  return ctx.scene.leave(); // enter show poll
});

addOptionScene.on('text', async (ctx) => {
  if (!ctx.session.questionId) {
    throw new Error('ctx.scene.session.questionId undefined');
  }

  const option = await addOption(ctx.session.questionId, ctx.message.text);

  return ctx.replyWithHTML(`Added option:\n<b>${option.option}</b>\n\nNow send me another answer option.\nWhen you've added enough, simply send /done to finish up.`);
});
