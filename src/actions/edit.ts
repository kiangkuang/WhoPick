import { ActionContext } from '.';
import { getEditMenu } from '../keyboard';
import { getQuestion } from '../repository';

export async function edit(ctx: ActionContext) {
  const [, questionId] = ctx.match;

  const question = await getQuestion(parseInt(questionId));

  ctx.editMessageReplyMarkup({
    inline_keyboard: getEditMenu(question!),
  });
}
