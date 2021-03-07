import Debug from 'debug';
import express from 'express';
import { Scenes, session, Telegraf } from 'telegraf';
import { deleteOption } from './actions/deleteOption';
import { edit } from './actions/edit';
import { editOptions } from './actions/editOptions';
import { editOptionsMenu } from './actions/editOptionsMenu';
import { editQuestion } from './actions/editQuestion';
import { inlineQuery } from './actions/inlineQuery';
import { refresh } from './actions/refresh';
import { setQuestion } from './actions/setQuestion';
import { vote } from './actions/vote';
import { Action, getActionRegExp, SceneId } from './enum';
import { addOptionScene } from './scenes/addOption';
import { editQuestionScene } from './scenes/editQuestion';
import { showPollScene } from './scenes/showPoll';
import { startScene } from './scenes/start';
import { WhoPickContext } from './session';

const debug = Debug('whopick');

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error('BOT_TOKEN must be provided!');
}

const bot = new Telegraf<WhoPickContext>(token);
const stage = new Scenes.Stage<WhoPickContext>([
  startScene,
  addOptionScene,
  showPollScene,
  editQuestionScene,
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
bot.action(getActionRegExp(Action.AddOptions), (ctx) => console.log(ctx.match.groups!.questionId));
bot.action(getActionRegExp(Action.EditOption), (ctx) => console.log(ctx.match.groups!.optionId));
bot.action(getActionRegExp(Action.DeleteOption), deleteOption);

bot.command('start', (ctx) => ctx.scene.enter(SceneId.Start));

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
