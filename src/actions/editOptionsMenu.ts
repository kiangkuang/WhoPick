import { ActionContext } from '../context';
import { getEditOptionsMenu } from '../keyboard';
import { getQuestion } from '../repository';

export async function editOptionsMenu(ctx: ActionContext) {
  const [, questionId] = ctx.match;

  const question = await getQuestion(parseInt(questionId));

  ctx.editMessageReplyMarkup({
    inline_keyboard: getEditOptionsMenu(question!),
  });
}
