import { Promise as bluebird } from 'bluebird'
import { default as Bot } from '../bot'
import { coinflip } from '../../'
import config from '../../../../config'

Bot.prototype.handleCoinflipFailed = function(offer, reason) {
  /* all coinflip logic should be handled in the coinflip manager */
  coinflip.handleDeclinedTrade.call(coinflip, offer, reason)
}

Bot.prototype.handleCoinflipAccepted = function(offer) {
  /* all coinflip logic should be handled in the coinflip manager */
  coinflip.handleAcceptedTrade.call(coinflip, offer)
}

Bot.prototype.sendCoinflipRequest = function(coinflipOffer) {
  return new Promise((resolve, reject) => {
    const steamOffer = this.manager.createOffer(coinflipOffer.tradeUrl) /* create a trade offer with the passed URL, will error if invalid */

    /* attach promises to the TradeOffer prototype for async */
    const getUserDetailsAsync = bluebird.promisify(steamOffer.getUserDetails, { context: steamOffer, multiArgs: true })
    const sendAsync = bluebird.promisify(steamOffer.send, { context: steamOffer })

    getUserDetailsAsync().then(([bot, user]) => {

      /* check if the user and the bot are not in escrow and are not on probation */
      if (!this.canTrade(bot)) {
        throw new Error('Bot is unable to trade -- please retry')
      } else if (!this.canTrade(user)) {
        throw new Error('Your account must be Steam Guard Authenticated')
      }

      /* attach appid and contextid to all the items */
      const userItems = this.formatItems(coinflipOffer.userItems)

      steamOffer.setMessage(`Trade offer sent from ${config.metadata.name} coinflip. Your trade ID: ${coinflipOffer._id}`)
      steamOffer.addTheirItems(userItems)

      return this.addMyItems(coinflipOffer.botItems, steamOffer)
    }).then(() => sendAsync()).then(status => {
      if (status === 'pending' && coinflipOffer.botItems.length === 0) {
        steamOffer.cancel()
        return reject(new Error('Trade went to escrow'))
      }

      /* make sure to track the coinflipOfferId for later usage */
      steamOffer.offerId = coinflipOffer._id
      resolve(steamOffer) /* resolve the trade offer back to the user */

      if (coinflipOffer.botItems.length > 0) {
        this.community.acceptConfirmationForObject(this.identitySecret, steamOffer.id, (err) => {
          if (err) {
            this.log(`error accepting confirmation on winnings: ${err.message}`)
          } else {
            this.log(`accepted confirmation on winnings trade ID: ${steamOffer.id}`)
          }
        })
      }
    }).catch(error => {
      /* set the coinflip offer to failed after a failed steam offer */
      if (coinflipOffer.setFailed) {
        coinflipOffer.setFailed(6).catch(error => {
          this.log(`error setting a trade offer to failed: ${error.message}`)
        })
      }
      console.log(error)
      reject(error)
    })
  })
}
