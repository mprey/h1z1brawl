import { default as Bot } from '../bot'
import { Promise as bluebird } from 'bluebird'
import config from '../../../../config'

Bot.prototype.sendRakesRequest = function(user, rakeItems) {
  return new Promise((resolve, reject) => {
    if (!user.tradeUrl) {
      return reject(new Error('Set your trade URL before requesting items'))
    }
    const steamOffer = this.manager.createOffer(user.tradeUrl) /* create a trade offer with the passed URL, will error if invalid */

    /* attach promises to the TradeOffer prototype for async */
    const getUserDetailsAsync = bluebird.promisify(steamOffer.getUserDetails, { context: steamOffer, multiArgs: true })
    const sendAsync = bluebird.promisify(steamOffer.send, { context: steamOffer })

    getUserDetailsAsync().then(([bot, user]) => {

      /* check if the user and the bot are not in escrow and are not on probation */
      if (!this.canTrade(bot)) {
        return reject(new Error('Bot is unable to trade -- please retry'))
      } else if (!this.canTrade(user)) {
        return reject(new Error('Your account must be Steam Guard Authenticated'))
      }

      steamOffer.setMessage(`Rake trade offer sent from ${config.metadata.name}.`)
      
      return this.addMyItems(rakeItems, steamOffer)
    }).then(() => sendAsync()).then(status => {
      resolve(steamOffer) /* resolve the trade offer back to the user */

      this.community.acceptConfirmationForObject(this.identitySecret, steamOffer.id, (err) => {
        if (err) {
          this.log(`error accepting confirmation on rake trade: ${err.message}`)
        } else {
          this.log(`accepted confirmation on rake trade ID: ${steamOffer.id}`)
        }
      })
    }).catch(reject)
  })
}

Bot.prototype.sendRakeRequest = function(user, rakeItem) {
  return new Promise((resolve, reject) => {
    if (!user.tradeUrl) {
      return reject(new Error('Set your trade URL before requesting items'))
    }
    const steamOffer = this.manager.createOffer(user.tradeUrl) /* create a trade offer with the passed URL, will error if invalid */

    /* attach promises to the TradeOffer prototype for async */
    const getUserDetailsAsync = bluebird.promisify(steamOffer.getUserDetails, { context: steamOffer, multiArgs: true })
    const sendAsync = bluebird.promisify(steamOffer.send, { context: steamOffer })

    getUserDetailsAsync().then(([bot, user]) => {

      /* check if the user and the bot are not in escrow and are not on probation */
      if (!this.canTrade(bot)) {
        return reject(new Error('Bot is unable to trade -- please retry'))
      } else if (!this.canTrade(user)) {
        return reject(new Error('Your account must be Steam Guard Authenticated'))
      }

      /* attach appid and contextid to all the items */
      const botItems = this.formatItems([rakeItem])

      steamOffer.setMessage(`Rake trade offer sent from ${config.metadata.name}.`)
      steamOffer.addMyItems(botItems)

      /* return a promise to send the trade offer through steam */
      return sendAsync()
    }).then(status => {
      resolve(steamOffer) /* resolve the trade offer back to the user */

      this.community.acceptConfirmationForObject(this.identitySecret, steamOffer.id, (err) => {
        if (err) {
          this.log(`error accepting confirmation on rake trade: ${err.message}`)
        } else {
          this.log(`accepted confirmation on rake trade ID: ${steamOffer.id}`)
        }
      })
    }).catch(reject)
  })
}
