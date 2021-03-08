import { ActionContext } from '../context';
import { SceneId } from '../enum';

export async function editQuestion(ctx: ActionContext) {
  const [, questionId] = ctx.match;

  ctx.session.questionId = parseInt(questionId);

  return ctx.scene.enter(SceneId.EditQuestion);
}
