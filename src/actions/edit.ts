import { ActionContext } from '.';
import { getEditMenu } from '../formatter';
import { getQuestion } from '../repository';

export async function edit(ctx: ActionContext) {
  const [, questionId] = ctx.match.input.split(':');

  const question = await getQuestion(parseInt(questionId));

  ctx.editMessageReplyMarkup({
    inline_keyboard: getEditMenu(question!),
  });
}
