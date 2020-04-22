import { default as CoinflipManager } from '../coinflipManager'
import { CoinflipOffer, Coinflip } from '../../../db'
import { findSocketById } from '../../../util/socket'
import { generateSecret } from '../../../util/random'
import { bot as botManager } from '../../'
import { coinflipOffer as coinflipOfferType } from '../../../constants'

CoinflipManager.prototype.handleDeclinedTrade = function(tradeOffer, reason) {
  CoinflipOffer.findByTradeOffer(tradeOffer).then(coinflipOffer => {
    if (coinflipOffer.type === coinflipOfferType.JOIN_GAME) {
      this.handleJoinGameDecline(coinflipOffer, reason)
    } else if (coinflipOffer.type === coinflipOfferType.NEW_GAME) {
      this.handleNewGameDecline(coinflipOffer, reason)
    } else if (coinflipOffer.type === coinflipOfferType.WINNINGS) {
      this.handleWinningsDecline(coinflipOffer, reason)
    }
  }).catch(error => {
    this.log(`error while handling coinflip decline request: ${error.message}`)
  })
}

CoinflipManager.prototype.handleJoinGameDecline = function(coinflipOffer, reason) {
  coinflipOffer.setFailed(reason).then(offer => {
    this.log(`set join game offer to failed with ID: ${offer._id} (${reason})`)
  }).catch(error => {
    this.log(`error setting join game offer to failed with ID: ${offer._id} (${reason})`)
  })

  /* find the coinflip game by trade offer, then remove the active joiner from it */
  Coinflip.findByCoinflipOffer(coinflipOffer).then(game => game.removeJoiner()).then(game => {
    /* send the updated game back to the clients, without secret data */
    this.publicIo.emit('COINFLIP_UPDATE_GAME', game.toCleanObject())
  }).catch(error => {
    this.log(`error while handling coinflip join game denial: ${error.message}`)
  })
}

CoinflipManager.prototype.handleNewGameDecline = function(coinflipOffer, reason) {
  const socket = findSocketById(this.secureIo, coinflipOffer.userId)

  coinflipOffer.setFailed(reason).then(offer => {
    this.log(`set new game offer to failed with ID: ${offer._id} (${reason})`)
  }).catch(error => {
    this.log(`error setting new game offer to failed with ID: ${offer._id} (${reason})`)
  })

  /* find the coinflip game by trade offer, then set the game to failed */
  Coinflip.findByCoinflipOffer(coinflipOffer).then(game => game.setFailed()).then(game => {
    if (socket) {
      socket.emit('NOTIFY', {
        type: 'error',
        message: `Your coinflip game has been canceled. ID: ${game._id}`
      })
    }
    return true
  }).catch(error => {
    this.log(`error while handling coinflip new game denial: ${error.message}`)
  })
}

CoinflipManager.prototype.handleWinningsDecline = function(coinflipOffer, reason) {
  coinflipOffer.setFailed(reason).then(offer => {
    this.log(`set winnings offer to failed with ID: ${offer._id} (${reason})`)
  }).catch(error => {
    this.log(`error setting winnings offer to failed with ID: ${offer._id} (${reason})`)
  })
}

CoinflipManager.prototype.declineCoinflipRequestAsync = function(tradeOffer, reason) {
  return new Promise((resolve, reject) => {
    CoinflipOffer.findByTradeOffer({ tradeId: tradeOffer._id }).then(coinflipOffer => {
      if (coinflipOffer.type === coinflipOfferType.JOIN_GAME) {
        return this.handleJoinGameDeclineAsync(coinflipOffer, reason)
      } else if (coinflipOffer.type === coinflipOfferType.NEW_GAME) {
        return this.handleNewGameDeclineAsync(coinflipOffer, reason)
      } else if (coinflipOffer.type === coinflipOfferType.WINNINGS) {
        return this.handleWinningsDeclineAsync(coinflipOffer, reason)
      }
      return false
    }).then(resolve).catch(reject)
  })
}

CoinflipManager.prototype.handleJoinGameDeclineAsync = function(coinflipOffer, reason) {
  return new Promise((resolve, reject) => {
    coinflipOffer.setFailed(reason).catch(error => {
      this.log(`error declining a join game request async: ${error.message}`)
    })

    Coinflip.findByCoinflipOffer(coinflipOffer).then(game => {
      this.cancelCoinflipOffer(coinflipOffer).catch(error => {
        this.log(`error canceling a Steam offer: ${error.message}`)
      })
      /* remove the joiner from the game */
      return game.removeJoiner()
    }).then(game => {
      /* update the removed joiner on client-side */
      this.publicIo.emit('COINFLIP_UPDATE_GAME', game.toCleanObject()) /* dont send secure data */
      resolve()
    }).catch(reject)
  })
}

CoinflipManager.prototype.handleNewGameDeclineAsync = function(coinflipOffer, reason) {
  return new Promise((resolve, reject) => {
    coinflipOffer.setFailed(reason).catch(error => {
      this.log(`error declining a new game request async: ${error.message}`)
    })

    /* find the coinflip game by offer, then cancel the existing Steam trade offer with the player */
    Coinflip.findByCoinflipOffer(coinflipOffer).then(game => {
      this.cancelCoinflipOffer(coinflipOffer).catch(error => {
        this.log(`error canceling a Steam offer: ${error.message}`)
      })
      /* set the coinflip game to failed */
      return game.setFailed()
    }).then(resolve).catch(reject)
  })
}

CoinflipManager.prototype.handleWinningsDeclineAsync = function(coinflipOffer, reason) {
  this.cancelCoinflipOffer(coinflipOffer).catch(error => {
    this.log(`error canceling a Steam offer: ${error.message}`)
  })

  return coinflipOffer.setFailed(reason)
}

CoinflipManager.prototype.cancelCoinflipOffer = function({ tradeId, botId }) {
  return new Promise((resolve, reject) => {
    if (!tradeId) {
      return reject(new Error('No trade ID specified in coin flip offer'))
    }
    if (!botId || !botManager.isBotAvailable(botId)) {
      return reject(new Error('Bot is offline'))
    }
    const bot = botManager.getBot(botId)
    bot.cancelTrade(tradeId).then(data => {
      resolve()
    }).catch(reject)
  })
}
