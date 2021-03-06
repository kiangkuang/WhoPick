import { ActionContext } from '.';
import { updateQuestion } from '../repository';
import { refresh } from './refresh';

export async function setQuestion(ctx: ActionContext) {
  const [, questionId, key, value] = ctx.match.input.split(':');

  await updateQuestion(parseInt(questionId), {
    [key]: value === 'true',
  });

  await refresh(ctx, true);
}
