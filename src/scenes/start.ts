import { Scenes } from 'telegraf';
import { SceneId } from '../enum';
import { getName } from '../formatter';
import { addOption, addQuestion, updateQuestion } from '../repository';
import { StartContext, WhoPickContext } from '../context';

export const startScene = new Scenes.BaseScene<WhoPickContext>(SceneId.Start);

startScene.enter(async (ctx: StartContext) => {
  if ('startPayload' in ctx && ctx.startPayload && ctx.startPayload !== '_') {
    const [questionString, ...options] = ctx.startPayload.trim().split('\n');

    const question = await addQuestion(ctx.from!.id, getName(ctx.from!), questionString);
    ctx.session.questionId = question.id;

    if (options?.length) {
      await Promise.all(options.map((option) => addOption(ctx.session.questionId, option)));
      await updateQuestion(ctx.session.questionId, {
        isEnabled: true,
      });

      ctx.replyWithHTML('Done! You can now share it to a group or send it to your friends in a private message.\nTo do this, tap the button below or start your message in any other chat with <code>@WhoPickBot</code> and select one of your polls that appear to send.');

      return ctx.scene.enter(SceneId.ShowPoll);
    }

    ctx.replyWithHTML(`Creating a new poll:\n<b>${questionString}</b>`);
    return ctx.scene.enter(SceneId.AddOption);
  }

  return ctx.scene.enter(SceneId.AddQuestion);
});

startScene.command('done', (ctx) => ctx.scene.leave());
