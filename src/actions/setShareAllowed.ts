import { ActionContext } from '.';
import { updateQuestion } from '../repository';
import { refresh } from './refresh';

export async function setShareAllowed(ctx: ActionContext) {
  const [, questionId, isShareAllowed] = ctx.match.input.split(':');

  await updateQuestion(parseInt(questionId), {
    isShareAllowed: isShareAllowed === 'true',
  });

  await refresh(ctx, true);
}
