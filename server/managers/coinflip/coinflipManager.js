import { Coinflip, CoinflipOffer } from '../../db'
import { bot as botManager } from '../'
import { generateSecret } from '../../util/random'
import { coinflipOffer as coinflipOfferType } from '../../constants'

class CoinflipManager {

  setSecureIo(io) {
    this.secureIo = io
  }

  setPublicIo(io) {
    this.publicIo = io
  }

  log(message) {
    console.log(`Coinflip - ${message}`)
  }

  isGameOpen(data, user) {
    return new Promise((resolve, reject) => {
      Coinflip.findById(data.game._id).exec().then(game => {
        if (game.creator.id === user._id && process.env.NODE_ENV === 'production') { /* I keep forgetting to uncomment this when i push it into production, so now its like this */
          return reject(new Error('You cannot join your own game'))
        }
        if (game.open && !game.joiner.id) {
          return resolve(data)
        }
        return reject(new Error('Game is not open'))
      }).catch(reject)
    })
  }

  createGame(user, { side, items, timeout }) {
    return new Promise((resolve, reject) => {
      const coinflip = new Coinflip({
        creator: {
          id: user._id,
          name: user.name,
          image: user.image,
          items
        },
        startingSide: side,
        timeout
      })

      coinflip.save()
        .then(coinflipGame => resolve({ user, coinflipGame }))
        .catch(reject)
    })
  }

  checkJoinerStatus(id, offer) {
    Coinflip.findById(id).exec().then(game => {
      /* if the game isn't completed, that means the joiner did not accept the trade */
      if (!game.completed) {
        game.removeJoiner().then(game => {

          /* cancel the existing Steam trade offer */
          this.cancelCoinflipOffer(offer).catch(error => {
            this.log(`error canceling a Steam trade: ${error.message}`)
          })

          /* update the game client-side without the joiner */
          this.publicIo.emit('COINFLIP_UPDATE_GAME', game.toCleanObject())
        }).catch(error => {
          this.log(`error while canceling a join offer: ${error.message}`)
        })
      }
    }).catch(error => {
      this.log(`error while canceling a join offer: ${error.message}`)
    })
  }

  resendTradeOffer(coinflipOffer) {
    return new Promise((resolve, reject) => {
      const bot = botManager.getBot(coinflipOffer.botId)
      if (!bot || !bot.enabled) {
        return reject(new Error('The requested bot is not online'))
      }
      bot.sendCoinflipRequest(coinflipOffer).then(resolve).catch(reject)
    })
  }

  createJoinOffer({ user, data: { items, game } }) {
    return new Promise((resolve, reject) => {
      CoinflipOffer.findByGame(game).then(offer => {
        const { botId } = offer
        if (!botManager.isBotAvailable(botId)) {
          return reject(new Error('Bot is unavailable to trade'))
        }

        const bot = botManager.getBot(botId)

        Coinflip.findById(game._id).exec().then(game => {
          new CoinflipOffer({
            _id: generateSecret(),
            userId: user._id,
            tradeUrl: user.tradeUrl,
            gameId: game._id,
            botId: botId,
            userItems: items,
            type: coinflipOfferType.JOIN_GAME
          }).save().then(offer => {
            game.setJoiner(user, items).then(game => {
              this.publicIo.emit('COINFLIP_UPDATE_GAME', game.toCleanObject())
            })
            setTimeout(() => {
              this.checkJoinerStatus(game._id, offer)
            }, 2 * 60 * 1000)
            bot.sendCoinflipRequest(offer).then(tradeOffer => {
              offer.setTradeId(tradeOffer.id)
              resolve(tradeOffer)
            }).catch(error => {
              game.removeJoiner().then(game => {
                this.publicIo.emit('COINFLIP_UPDATE_GAME', game.toCleanObject())
              })
              reject(error)
            })
          }).catch(reject)
        }).catch(reject)
      }).catch(reject)
    })
  }

  sendCoinflipRequest({ user, coinflipGame, data }) {
    return new Promise((resolve, reject) => {
      botManager.getNextBot().then(bot => { /* get the next available bot to send an offer */
        new CoinflipOffer({
          _id: generateSecret(),
          userId: user._id,
          tradeUrl: user.tradeUrl,
          gameId: coinflipGame._id, /* coinflip gameId to attach the trade offer to a game */
          botId: bot.client.steamID.getSteamID64(),
          userItems: data.items,
        }).save().then(tradeOffer => { /* use mongoose async to save a newly created trade offer */
          bot.sendCoinflipRequest(tradeOffer).then(offer => { /* return a promise to send a trade offer request to the user */
            tradeOffer.setTradeId(offer.id)
            setTimeout(() => {
              this.checkCoinflipRequest(tradeOffer)
            }, 2 * 60 * 1000)
            resolve(offer)
          }).catch(reject)
        }).catch(reject)
      }).catch(reject)
    })
  }

  checkCoinflipRequest(coinflipOffer) {
    CoinflipOffer.findById(coinflipOffer._id).exec().then(offer => {
      if (!offer.completed && !offer.failed) {
        offer.setFailed(6)
        this.cancelCoinflipOffer(offer).catch(error => {
          this.log(`error canceling steam offer: ${error.message}`)
        })
      }
    })
  }

}

export default CoinflipManager

require('./components/acceptTrade')
require('./components/declineTrade')
