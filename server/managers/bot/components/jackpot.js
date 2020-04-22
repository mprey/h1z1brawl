import { Promise as bluebird } from 'bluebird'
import { default as Bot } from '../bot'
import { jackpot } from '../../'

Bot.prototype.handleJackpotFailed = function(offer, reason) {
  /* all coinflip logic should be handled in the jackpot manager */
  jackpot.handleDeclinedTrade.call(jackpot, offer, reason)
}

Bot.prototype.handleJackpotAccepted = function(offer) {
  /* all jackpot logic should be handled in the jackpot manager */
  jackpot.handleAcceptedTrade.call(jackpot, offer)
}

Bot.prototype.sendJackpotRequest = function(jackpotOffer) {
  return new Promise((resolve, reject) => {
    const steamOffer = this.manager.createOffer(jackpotOffer.tradeUrl) /* create a trade offer with the passed URL, will error if invalid */

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
      const userItems = this.formatItems(jackpotOffer.userItems)
      const botItems = this.formatItems(jackpotOffer.botItems)

      steamOffer.setMessage(`Trade offer sent from H1Z1Brawl jackpot. Your trade ID: ${jackpotOffer._id}`)
      steamOffer.addTheirItems(userItems)
      steamOffer.addMyItems(botItems)

      /* return a promise to send the trade offer through steam */
      return sendAsync()
    }).then(status => {
      if (status === 'pending' && jackpotOffer.botItems.length === 0) {
        steamOffer.cancel()
        return reject(new Error('Trade went to escrow'))
      }

      /* make sure to track the jackpotOfferId for later usage */
      steamOffer.offerId = jackpotOffer._id
      resolve(steamOffer) /* resolve the trade offer back to the user */

      if (jackpotOffer.botItems.length > 0) {
        this.community.acceptConfirmationForObject(this.identitySecret, steamOffer.id, (err) => {
          if (err) {
            this.log(`error accepting confirmation on winnings: ${err.message}`)
          } else {
            this.log(`accepted confirmation on winnings trade ID: ${steamOffer.id}`)
          }
        })
      }
    }).catch(reject)
  })
}
