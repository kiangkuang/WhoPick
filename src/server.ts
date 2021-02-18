import Debug from 'debug';
import express from 'express';
import { Scenes, session, Telegraf } from 'telegraf';
import { SceneId } from './enum';
import { addOptionScene } from './scenes/addOption';
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
], {
  ttl: 300,
});

bot.use(session());
bot.use(stage.middleware());

bot.command('start', (ctx) => ctx.scene.enter(SceneId.Start));
bot.on('message', (ctx) => ctx.reply('Sorry I didn\'t get what you mean. Try sending /start to create a new poll!'));

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
