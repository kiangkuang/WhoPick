import Debug from 'debug';
import express from 'express';
import { Scenes, session, Telegraf } from 'telegraf';
import { addOptions } from './actions/addOptions';
import { deleteOption } from './actions/deleteOption';
import { edit } from './actions/edit';
import { editOption } from './actions/editOption';
import { editOptions } from './actions/editOptions';
import { editOptionsMenu } from './actions/editOptionsMenu';
import { editQuestion } from './actions/editQuestion';
import { inlineQuery } from './actions/inlineQuery';
import { refresh } from './actions/refresh';
import { setQuestion } from './actions/setQuestion';
import { vote } from './actions/vote';
import { Action, getActionRegExp, SceneId } from './enum';
import { addOptionScene } from './scenes/addOption';
import { addQuestionScene } from './scenes/addQuestion';
import { editOptionScene } from './scenes/editOption';
import { editQuestionScene } from './scenes/editQuestion';
import { pollsScene } from './scenes/polls';
import { showPollScene } from './scenes/showPoll';
import { WhoPickContext } from './session';

const debug = Debug('whopick');

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf<WhoPickContext>(token);
const stage = new Scenes.Stage<WhoPickContext>([
  addQuestionScene,
  addOptionScene,
  showPollScene,
  editQuestionScene,
  editOptionScene,
  pollsScene,
], {
  ttl: 300,
});

bot.use(session());
bot.use(stage.middleware());

bot.action(getActionRegExp(Action.RefreshAdmin), (ctx) => refresh(ctx, true));
bot.action(getActionRegExp(Action.Refresh), (ctx) => refresh(ctx, false));
bot.action(getActionRegExp(Action.Vote), vote);
bot.action(getActionRegExp(Action.SetQuestion), setQuestion);
bot.action(getActionRegExp(Action.Edit), edit);
bot.action(getActionRegExp(Action.EditQuestion), editQuestion);
bot.action(getActionRegExp(Action.EditOptionsMenu), editOptionsMenu);
bot.action(getActionRegExp(Action.EditOptions), (ctx) => editOptions(ctx, Action.EditOption));
bot.action(getActionRegExp(Action.DeleteOptions), (ctx) => editOptions(ctx, Action.DeleteOption));
bot.action(getActionRegExp(Action.AddOptions), addOptions);
bot.action(getActionRegExp(Action.EditOption), editOption);
bot.action(getActionRegExp(Action.DeleteOption), deleteOption);

bot.command('start', (ctx) => ctx.scene.enter(SceneId.AddQuestion));
bot.command('polls', (ctx) => ctx.scene.enter(SceneId.Polls));

bot.on('inline_query', inlineQuery);
bot.on('message', (ctx) => ctx.reply('Sorry I didn\'t get what you mean. Try sending /start to create a new poll!'));

bot.catch(((err) => {
  debug(err);
  // throw (err);
}));

// Set telegram webhook
if (process.env.NODE_ENV === 'local') {
  bot.launch();
} else {
  bot.telegram.setWebhook(`https://${process.env.HEROKU_APP_NAME}.herokuapp.com/bot`);
}

const app = express();
app.get('/', (req, res) => res.send('Hello World!'));
// Set the bot API endpoint
app.use(bot.webhookCallback('/bot'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  debug(`Listening on port ${port}`);
});
