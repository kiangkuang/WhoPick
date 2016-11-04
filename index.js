'use strict'

require('dotenv').config({silent: process.env.NODE_ENV === 'production'})

if (!process.env.BOT_TOKEN || process.env.BOT_TOKEN === '<token>') {
    console.log('ERROR: "BOT_TOKEN" env variable not set.')
    return
}

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
        $.sendMessage('pong ' + process.env.NODE_ENV)
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