import { Markup } from 'telegraf';
import { ActionContext } from '.';
import { getAdminKeyboard, toString } from '../formatter';
import { getQuestion } from '../repository';

export async function refreshAdmin(ctx: ActionContext) {
  const [, questionId] = ctx.match.input.split(':');
  const question = await getQuestion(parseInt(questionId));
  if (question) {
    try {
      await ctx.editMessageText(toString(question), {
        ...Markup.inlineKeyboard(getAdminKeyboard(question)),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
    } finally {
      await ctx.answerCbQuery('Poll updated!');
    }
  }
}
