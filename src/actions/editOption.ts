import { ActionContext } from '.';
import { SceneId } from '../enum';

export async function editOption(ctx: ActionContext) {
  const [, questionId, optionId] = ctx.match;

  ctx.session.questionId = parseInt(questionId);
  ctx.session.optionId = parseInt(optionId);

  return ctx.scene.enter(SceneId.EditOption);
}
