import { ActionContext } from '.';
import { getEditOptionsMenu } from '../formatter';
import { getQuestion } from '../repository';

export async function editOptionsMenu(ctx: ActionContext) {
  const [, questionId] = ctx.match;

  const question = await getQuestion(parseInt(questionId));

  ctx.editMessageReplyMarkup({
    inline_keyboard: getEditOptionsMenu(question!),
  });
}
