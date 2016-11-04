'use strict'

const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController
const TextCommand = Telegram.TextCommand

const tg = process.env.NODE_ENV === 'production' ?
    new Telegram.Telegram(process.env.BOT_TOKEN, {
        webhook: {
            url: 'https://whopick.herokuapp.com',
            port: process.env.PORT,
            host: '0.0.0.0'
        }
    }) : 
    new Telegram.Telegram(process.env.BOT_TOKEN)

class PingController extends TelegramBaseController {
    /**
     * @param {Scope} $
     */
    pingHandler($) {
        $.sendMessage('pong')
    }

    get routes() {
        return {
            'pingCommand': 'pingHandler'
        }
    }
}

tg.router
    .when(
        new TextCommand('ping', 'pingCommand'),
        new PingController()
    )