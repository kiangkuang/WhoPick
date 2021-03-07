import { Markup } from 'telegraf';
import { ActionContext } from '.';
import { getKeyboard, toString } from '../formatter';
import { getQuestion } from '../repository';

export async function refresh(ctx: ActionContext, isAdmin: boolean) {
  const [, questionId] = ctx.match;

  const question = await getQuestion(parseInt(questionId));

  try {
    await ctx.editMessageText(toString(question!), {
      ...Markup.inlineKeyboard(getKeyboard(question!, isAdmin)),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  } finally {
    await ctx.answerCbQuery('Poll updated!');
  }
}
