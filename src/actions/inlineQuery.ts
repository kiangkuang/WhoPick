import { Op } from 'sequelize';
import _ from 'lodash';
import { Markup } from 'telegraf';
import { InlineQueryResultArticle } from 'telegraf/typings/telegram-types';
import { InlineQueryContext } from '.';
import { getQuestions } from '../repository';
import { getDescription, getKeyboard, toString } from '../formatter';

export async function inlineQuery(ctx: InlineQueryContext) {
  const ownQuestions = getQuestions({
    question: {
      [Op.substring]: ctx.inlineQuery.query,
    },
    isEnabled: 1,
    userId: ctx.inlineQuery.from.id,
  });
  const participatedQuestions = getQuestions({
    question: {
      [Op.substring]: ctx.inlineQuery.query,
    },
    isEnabled: 1,
    isShareAllowed: 1,
    '$options.votes.userId$': ctx.inlineQuery.from.id,
  });

  const questions = _
    .chain(await ownQuestions)
    .unionBy(await participatedQuestions, (x) => x.id)
    .orderBy((x) => x.updatedAt, 'desc')
    .take(10)
    .value();

  const results: InlineQueryResultArticle[] = questions.map((question) => ({
    type: 'article',
    id: question.id.toString(),
    title: question.question,
    description: getDescription(question),
    input_message_content: {
      message_text: toString(question),
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    },
    ...Markup.inlineKeyboard(getKeyboard(question, false)),
  }));

  return ctx.answerInlineQuery(results, {
    cache_time: 0,
    is_personal: true,
    switch_pm_text: 'Create new poll',
    switch_pm_parameter: '0',
  });
}
