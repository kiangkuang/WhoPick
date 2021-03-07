import { ActionContext } from '.';
import { SceneId } from '../enum';

export async function addOptions(ctx: ActionContext) {
  const [, questionId] = ctx.match;

  ctx.session.questionId = parseInt(questionId);

  return ctx.scene.enter(SceneId.AddOption);
}
