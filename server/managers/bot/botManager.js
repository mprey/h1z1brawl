import config from '../../../config'
import { default as Bot } from './bot'
import { Bot as BotModel } from '../../db/'

const settings = config.bots

class BotManager {

  constructor() {
    this.bots = []
    this.currentBotIndex = 0
    this.loadBoat = this.loadBot.bind(this);

    BotModel.getBots(bot => this.loadBot({ ...bot, ...settings }), (err) => {
      console.log(`>> Error while loading bots: ${err}`);
    });
  }

  loadBot(options) {
    const bot = new Bot(options)
    this.bots.push(bot)
    bot.init()
  }

  checkBotsAvailability() {
    for (const bot of Object.values(this.bots)) {
      if (bot.enabled) {
        return true
      }
    }
    return false
  }

  getBot(botId) {
    for (const bot of Object.values(this.bots)) {
      if (bot.getSteamID64() === botId) {
        return bot
      }
    }
    return null
  }

  isBotAvailable(botId) {
    for (const bot of Object.values(this.bots)) {
      if (bot.getSteamID64() === botId && bot.enabled) {
        return true
      }
    }
    return false
  }

  getJackpotBot() {
    if (!this.jackpotBot) {
      this.jackpotBot = this.getNextBotSync()
    }
    return this.jackpotBot
  }

  getNextBotSync() {
    if (this.bots.length == 0 || !this.checkBotsAvailability()) {
      throw new Error('No available bots to trade')
    }

    const nextBot = () => {
      if (this.currentBotIndex >= this.bots.length) {
        this.currentBotIndex = 0;
      }

      const bot = this.bots[this.currentBotIndex];
      this.currentBotIndex++;

      if (bot && bot.enabled) {
        return bot;
      } else {
        return nextBot();
      }
    }

    const bot = nextBot()

    return bot
  }

  getNextBot() {
    return new Promise((resolve, reject) => {
      if (this.bots.length == 0 || !this.checkBotsAvailability()) {
        reject(new Error('No available bots to trade'))
      }

      const nextBot = () => {
        if (this.currentBotIndex >= this.bots.length) {
          this.currentBotIndex = 0;
        }

        const bot = this.bots[this.currentBotIndex];
        this.currentBotIndex++;

        if (bot && bot.enabled) {
          return bot;
        } else {
          return nextBot();
        }
      }

      const bot = nextBot()

      resolve(bot)
    })
  }

}

const bot = new BotManager()

export { bot }
