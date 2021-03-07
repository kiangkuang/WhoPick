import { ActionContext } from '.';
import { Action } from '../enum';
import { getOptionsMenu } from '../formatter';
import { getQuestion } from '../repository';

export async function editOptions(
  ctx: ActionContext,
  type: Action.EditOption | Action.DeleteOption,
) {
  const [, questionId] = ctx.match.input.split(':');

  const question = await getQuestion(parseInt(questionId));

  ctx.editMessageReplyMarkup({
    inline_keyboard: getOptionsMenu(question!, type),
  });
}
