import { default as Bot } from '../bot'
import TradeOfferManager from 'steam-tradeoffer-manager'
import SteamCommunity from 'steamcommunity'
import { Promise as bluebird } from 'bluebird'
import config from '../../../../config'

const {
  Invalid,
  Active,
  Accepted,
  Countered,
  Expired,
  Canceled,
  Declined,
  InvalidItems,
  CreatedNeedsConfirmation,
	CanceledBySecondFactor,
	InEscrow
} = TradeOfferManager.ETradeOfferState

bluebird.promisifyAll(TradeOfferManager.prototype)

Bot.prototype.createManager = function() {
  if (this.manager) return

  this.community = new SteamCommunity()

  this.manager = new TradeOfferManager({
    steam: this.client,
    domain: this.domain,
    community: this.community,
    language: 'en',
    pollInterval: this.pollTime,
  })

  this.manager.on('newOffer', this.newOffer.bind(this))
  this.manager.on('sentOfferChanged', this.sentOfferChanged.bind(this))
  this.community.on('sessionExpired', this.webLogin.bind(this))
}

Bot.prototype.setSteamCookies = function(cookies) {
  this.manager.setCookiesAsync(cookies).then(data => {
    this.log('set cookies for tradeoffer-manager')
    this.enabled = true
  }).catch(err => {
    this.log(`error while setting cookies: ${err}`)
    this.enabled = false
  })
  this.community.setCookies(cookies)
  this.community.startConfirmationChecker(this.confirmationTime, this.identitySecret)
}

Bot.prototype.canTrade = function(userObject) {
  return userObject.escrowDays === 0 && userObject.probation ? (userObject.probation == false) : true
}

Bot.prototype.formatItems = function(items) {
  const array = []
  for (let i = 0; i < items.length; i++) {
    let item
    if (items[i].toObject) {
      item = items[i].toObject()
    } else {
      item = items[i]
    }
    array.push({
      ...item,
      appid: config.metadata.gameId,
      contextid: config.metadata.contextId
    })
  }
  return array
}

Bot.prototype.addMyItems = function(items, offer) {
  return new Promise((resolve, reject) => {
    if (items.length === 0) {
      return resolve()
    }

    this.manager.getInventoryContents(config.metadata.gameId, config.metadata.contextId, true, (err, inventory) => {
      if (err) {
        return reject(err)
      }
      for (const myItem of items) {
        const botIndex = inventory.findIndex((item) => item.market_hash_name === myItem.name)
        if (botIndex >= 0) {
          offer.addMyItem(inventory[botIndex])
          inventory.splice(botIndex, 1)
        } else {
          this.log(`unable to find bot item for name: ${myItem.name}`)
        }
      }
      return resolve()
    });
  })
} 

Bot.prototype.offerAccepted = function(offer) {
  if (offer.type === 'coinflip') {
    this.handleCoinflipAccepted(offer)
  } else if (offer.type === 'jackpot') {
    this.handleJackpotAccepted(offer)
  }
}

Bot.prototype.offerFailed = function(offer, reason) {
  if (offer.type === 'coinflip') {
    this.handleCoinflipFailed(offer, reason)
  } else if (offer.type === 'jackpot') {
    this.handleJackpotFailed(offer, reason)
  }
}

Bot.prototype.newOffer = function(offer) {
  this.log(`new Offer - ${offer}`)
  /* TODO allow admins to send offers */
}

Bot.prototype.sentOfferChanged = function(offer, oldState) { //TODO check how CreatedNeedsConfirmation works
  const { state } = offer
  const { type,  tradeId } = this.getTradeOfferData(offer)
  const newOffer = { ...offer, type, tradeId }
  if (state === Accepted) {
    this.offerAccepted(newOffer)
  } else if (state === InEscrow || state === Countered || state === InvalidItems || state === Invalid) {
    offer.cancel()
    this.offerFailed(newOffer, state)
  } else if (state === Declined || state === Expired || state === Canceled || state === CanceledBySecondFactor) {
    this.offerFailed(newOffer, state)
  }
}

Bot.prototype.cancelTrade = function(tradeId) {
  return new Promise((resolve, reject) => {
    this.manager.getOfferAsync(tradeId).then(offer => {
      if (offer) {
        offer.cancel()
        resolve()
      } else {
        reject(new Error('Unable to find specified trade ID'))
      }
    }).catch(reject)
  })
}

Bot.prototype.getTradeOfferData = function({ message }) {
  const data = {
    type: null,
    tradeId: null
  }

  /* get ID from offer message */
  const words = message.split(' ')
  data.tradeId = words[words.length - 1]

  /* get type from offer message */
  if (~message.indexOf('coinflip')) {
    data.type = 'coinflip'
  } else if (~message.indexOf('jackpot')) {
    data.type = 'jackpot'
  }

  return data
}
