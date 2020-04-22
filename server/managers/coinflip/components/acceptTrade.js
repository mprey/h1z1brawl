import { default as CoinflipManager } from '../coinflipManager'
import { CoinflipOffer, Coinflip, User, RakeItem } from '../../../db'
import { findSocketById } from '../../../util/socket'
import { generateSecret } from '../../../util/random'
import { bot as botManager } from '../../'
import { coinflipOffer as coinflipOfferType } from '../../../constants'
import { getCoinflipTotal, getCreatorTotal, getTotalWinnings, getJoinerTotal } from '../../../util/coinflip'

CoinflipManager.prototype.handleAcceptedTrade = function(tradeOffer) {
  CoinflipOffer.findByTradeOffer(tradeOffer).then(coinflipOffer => {
    if (coinflipOffer.type === coinflipOfferType.JOIN_GAME) {
      this.handleJoinGameAcceptance(coinflipOffer)
    } else if (coinflipOffer.type === coinflipOfferType.NEW_GAME) {
      this.handleNewGameAcceptance(coinflipOffer)
    } else if (coinflipOffer.type === coinflipOfferType.WINNINGS) {
      this.handleWinningsAcceptance(coinflipOffer)
    }
  }).catch(error => {
    this.log(`error while handling coinflip accept request: ${error.message}`)
  })
}

CoinflipManager.prototype.handleJoinGameAcceptance = function(coinflipOffer) {
  /* set the coinflip offer to accepted */
  coinflipOffer.setAccepted().then(offer => {
    this.log(`accepted join game request with ID: ${offer._id}`)
  }).catch(error => {
    this.log(`error accepting join game request ID: ${offer._id} (${error.message})`)
  })

  /* find the coinflip game that corresponds with the accepted offer and set the game state to completed */
  Coinflip.findByCoinflipOffer(coinflipOffer.toObject()).then(game => game.setCompleted()).then(game => {
    /* send the secret and percentage back to the client-side */
    this.publicIo.emit('COINFLIP_UPDATE_GAME', game.toObject())

    /* send the winnings of the coin flip winner */
    this.sendGameWinnings(game.toObject(), coinflipOffer.toObject())

    setTimeout(() => {
      this.publicIo.emit('COINFLIP_ADD_HISTORY', game.toObject())
    }, 30 * 1000) //add game to client-side history after 30 seconds
  }).catch(error => {
    this.log(`error while handling coinflip request: ${error.message}`)
  })
}

CoinflipManager.prototype.sendGameWinnings = function(game, coinflipOffer) { /* calculate tickets, see which side the creator started on, then check his percentage based on winning perctenage */
  /* get the game total and creator total to calculate percentage of creator's chance */
  const gameTotal = getCoinflipTotal(game), creatorTotal = getCreatorTotal(game), joinerTotal = getJoinerTotal(game)
  const percentage = ((creatorTotal / gameTotal) * 100)
  const redPercentage = 100 - percentage

  User.addTotalBet(game.creator.id, creatorTotal)
  User.addTotalBet(game.joiner.id, joinerTotal)

  /* black is 0-49%, and red is 50%-100% */
  const isBelow50 = (game.startingSide === 'black')
  let winner = game.joiner
  const { botId } = coinflipOffer

  if (game.winningPercentage <= percentage && isBelow50) {
    winner = game.creator
  } else if (game.winningPercentage >= redPercentage && !isBelow50) {
    winner = game.creator
  }

  const socket = findSocketById(this.secureIo, winner.id)

  User.findById(winner.id).exec().then(user => {
    /* add total won of the coinflip game to the winner's account */
    user.addTotalWon(gameTotal)

    const { winnings, rake } = getTotalWinnings(game, user) /* get the winnings, deducting tax (3% or 8%) */
    RakeItem.addRake(botId, rake)
    new CoinflipOffer({
      _id: generateSecret(),
      userId: user._id,
      tradeUrl: user.tradeUrl,
      gameId: game._id, /* coinflip gameId to attach the trade offer to a game */
      botId: botId,
      botItems: winnings,
      type: coinflipOfferType.WINNINGS
    }).save().then(newOffer => {
      /* check to see if the bot that contains all the items is available */
      if (!botManager.isBotAvailable(botId)) {
        if (socket) {
          socket.emit('NOTIFY', {
            type: 'error',
            message: 'Unable to find bot to trade. Please contact support.'
          })
        }
        return this.log(`unable to find the bot to send the winnings offer. bot ID: ${botId}`)
      }

      const bot = botManager.getBot(botId)
      bot.sendCoinflipRequest(newOffer).then(offer => {
        /* send the trade offer to the client via socket */
        if (socket) {
          setTimeout(() => {
            socket.emit('COINFLIP_OFFER', offer)
          }, 16 * 1000) // wait till client side animation takes place
        }
        newOffer.setTradeId(offer.id)
      }).catch(error => {
        this.log(`error while handling coinflip winnings: ${error.message}`)
      })
    }).catch(error => {
      this.log(`error while handling coinflip winnings: ${error.message}`)
    })
  }).catch(error => {
    this.log(`error while handling coinflip winnings: ${error.message}`)
  })
}

CoinflipManager.prototype.handleNewGameAcceptance = function(coinflipOffer) {
  /* set the coinflip offer to accepted */
  coinflipOffer.setAccepted().then(offer => {
    this.log(`accepted new game request with ID: ${offer._id}`)
  }).catch(error => {
    this.log(`error accepting new game request ID: ${offer._id} (${error.message})`)
  })

  /* find the coinflip game that corresponds with the accepted offer and set the games state to open */
  Coinflip.findByCoinflipOffer(coinflipOffer).then(game => game.setOpen()).then(game => {
    this.log(`new game sent to client with ID: ${game._id}`)

    this.publicIo.emit('COINFLIP_NEW_GAME', game.toCleanObject())

    if (game.timeout) {
      setTimeout(() => {
        this.checkGameCompletion(coinflipOffer)
      }, 30 * 60 * 1000) //30 minute time out
    }
  }).catch(error => {
    this.log(`error while handling coinflip request: ${error.message}`)
  })
}

CoinflipManager.prototype.handleWinningsAcceptance = function(coinflipOffer) {
  coinflipOffer.setAccepted().then(offer => {
    this.log(`accepted winning request with id of ${offer._id}`)
  })
}

/* check to see whether the game has been completed after 30 minutes */
CoinflipManager.prototype.checkGameCompletion = function(coinflipOffer) {
  Coinflip.findByCoinflipOffer(coinflipOffer).then(game => {
    if (game.open) {
      game.setFailed() /* set the state of the game to failed and closed */

      this.publicIo.emit('COINFLIP_REMOVE_GAME', game.toObject()) /* remove the game from client side */

      this.returnItems(coinflipOffer).then(result => {
        this.log(`successfully returned items after 30 minute time out`)
      }).catch(error => {
        this.log(`error returning items after time out: ${error.message}`)
      })
    }
  }).catch(error => {
    this.log(`error when checking game completion: ${error.message}`)
  })
}

/* send back the items to the coinflip creator after a time out */
CoinflipManager.prototype.returnItems = function(coinflipOffer) {
  return new Promise((resolve, reject) => {
    new CoinflipOffer({
      _id: generateSecret(),
      userId: coinflipOffer.userId,
      tradeUrl: coinflipOffer.tradeUrl,
      gameId: coinflipOffer.gameId,
      botId: coinflipOffer.botId,
      botItems: coinflipOffer.userItems,
      type: coinflipOfferType.WINNINGS
    }).save().then(newOffer => {
      const { botId } = newOffer
      if (!botManager.isBotAvailable(botId)) {
        return reject(new Error('Bot is unavailable to trade'))
      }

      const bot = botManager.getBot(botId)
      bot.sendCoinflipRequest(newOffer).then(offer => {
        newOffer.setTradeId(offer.id)
        resolve(offer)
      }).catch(reject)
    }).catch(reject)
  })
}
