import { ActionContext } from '.';
import { formatName } from '../formatter';
import { addVote, getQuestion, removeVote } from '../repository';
import { refresh } from './refresh';

export async function vote(ctx: ActionContext) {
  const [, questionId, optionId] = ctx.match.input.split(':');

  const question = await getQuestion(parseInt(questionId));
  if (!question) {
    throw new Error('question is null');
  }
  if (!ctx.from) {
    throw new Error('ctx.from is undefined');
  }

  if (question.isEnabled) {
    try {
      await addVote(parseInt(optionId), ctx.from?.id, formatName(ctx.from));
    } catch {
      await removeVote(parseInt(optionId), ctx.from?.id);
    }
  }
  await refresh(ctx, false);
}
