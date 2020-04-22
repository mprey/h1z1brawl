import { JackpotRound, JackpotOffer, User, RakeItem } from '../../db'
import { bot as botManager } from '../'
import { generateSecret } from '../../util/random'
import { getOfferTotal, getTotalWinnings } from '../../util/jackpot'
import { findSocketById } from '../../util/socket'
import { jackpotOffer as jackpotOfferType } from '../../constants'
import config from '../../../config'
import { removeCache } from '../../actions'

class JackpotManager {

  constructor() {
    this.loadRoundFromDatabase()
  }

  log(message) {
    console.log(`Jackpot - ${message}`)
  }

  setSecureIo(io) {
    this.secureIo = io
  }

  setPublicIo(io) {
    this.publicIo = io
  }

  loadRoundFromDatabase() {
    JackpotRound.findOne({ currentRound: true }).exec().then(round => {
      if (round !== null) {
        this.updateCurrentRound(round)
      } else {
        this.createNewRound()
      }
    }).catch(error => {
      this.log(`error loading round from db: ${error.message}`)
    })
  }

  depositItems(user, items) {
    return new Promise((resolve, reject) => {
      /* get a dedicated jackpot bot so all winnings/deposits will be in one bot */
      const bot = botManager.getJackpotBot()

      if (!bot || !bot.enabled) {
        return reject(new Error('Bot is offline'))
      }

      new JackpotOffer({
        _id: generateSecret(),
        userId: user._id,
        tradeUrl: user.tradeUrl,
        userItems: items,
        botId: bot.getSteamID64(),
        type: jackpotOfferType.DEPOSIT
      }).save().then(offer => {
        /* send the steam reques to the user */
        bot.sendJackpotRequest(offer).then(steamTrade => {
          /* attach the trade id to the JackpotOffer object in the database */
          offer.setTradeId(steamTrade.id)
          resolve(steamTrade)
          setTimeout(() => {
            this.cancelOfferIfOutstanding(offer)
          }, 2 * 60 * 1000)
        }).catch(error => {
          /* set the JackpotOffer object to failed if the steam offer has failed */
          offer.setFailed(error.message).catch(error => {
            this.log(`error setting offer to failed: ${error.message}`)
          })
          reject(error)
        })
      }).catch(reject)
    })
  }

  handleDeclinedTrade(offer, reason) {
    JackpotOffer.findByTradeOffer(offer).then(jackpotOffer => {
      jackpotOffer.setFailed(reason).catch(error => {
        this.log(`error setting jackpot offer to failed: ${error.message}`)
      })
    }).catch(error => {
      this.log(`error finding a jackpot offer: ${error.message}`)
    })
  }

  handleAcceptedTrade(offer) {
    JackpotOffer.findByTradeOffer(offer).then(jackpotOffer => {
      if (jackpotOffer.type === jackpotOfferType.DEPOSIT) {
        jackpotOffer.setAccepted()
        this.handleAcceptedDeposit(jackpotOffer)
      } else if (jackpotOffer.type === jackpotOfferType.WINNINGS) {
        jackpotOffer.setAccepted()
      }
      removeCache(jackpotOffer.userId)
    }).catch(error => {
      this.log(`error finding a jackpot offer: ${error.message}`)
    })
  }

  handleAcceptedDeposit(jackpotOffer) {
    User.addTotalBet(jackpotOffer.userId, getOfferTotal(jackpotOffer.toObject()))
    this.currentRound.addDeposit(jackpotOffer).then(round => {
      jackpotOffer.setRoundId(round._id)
      this.publicIo.emit('JACKPOT_UPDATE_ROUND', round.toCleanObject())
      this.updateCurrentRound(round)
      removeCache(jackpotOffer.userId)
    }).catch(error => {
      this.log(`error adding a deposit to the round: ${error.message}`)
    })
  }

  updateCurrentRound(currentRound) {
    this.currentRound = currentRound
    if (this.currentRound.deposits.length >= config.jackpot.game.depositsToStart && !this.hasTimerStarted) {
      this.hasTimerStarted = true
      this.log('starting the timer for the current jackpot round')
      this.currentRound.setTimerStarted().then(currentRound => {
        this.currentRound = currentRound
        this.publicIo.emit('JACKPOT_UPDATE_ROUND', currentRound.toCleanObject())
        setTimeout(() => {
          this.endCurrentRound() /* end the current round after 2 minutes */
        }, config.jackpot.countdowns.gameCountdown * 1000)
      })
    }
  }

  endCurrentRound() {
    this.log('ending the current round')
    this.currentRound.calculateWinner().then(round => {
      this.publicIo.emit('JACKPOT_END_ROUND', round.toObject())
      this.sendGameWinnings(round.toObject())
      this.createNewRound()
    }).catch(error => {
      this.log(`error calculating the winner on jackpot: ${error.message}`)
    })
  }

  resendTradeOffer(jackpotOffer) {
    return new Promise((resolve, reject) => {
      const bot = botManager.getBot(jackpotOffer.botId)
      if (!bot || !bot.enabled) {
        return reject(new Error('The requested bot is not online'))
      }
      bot.sendJackpotRequest(jackpotOffer).then(resolve).catch(reject)
    })
  }

  sendGameWinnings(jackpotRound) {
    this.log(`sending game winnings to: ${jackpotRound.winner.name}`)

    const { winner } = jackpotRound

    const socket = findSocketById(this.secureIo, winner.id)

    User.findById(winner.id).exec().then(user => {
      const { winnings, rake } = getTotalWinnings(jackpotRound, user) /* get the winnings, deducting tax (5% or 10%) */
      const bot = botManager.getJackpotBot()
      RakeItem.addRake(bot.getSteamID64(), rake)

      new JackpotOffer({
        _id: generateSecret(),
        userId: user._id,
        tradeUrl: user.tradeUrl,
        roundId: jackpotRound._id, /* jackpot roundId to attach the trade offer to a game */
        botId: bot.getSteamID64(),
        botItems: winnings,
        type: jackpotOfferType.WINNINGS
      }).save().then(newOffer => {
        /* check to see if the bot that contains all the items is available */
        if (!bot || !bot.enabled) {
          if (socket) {
            socket.emit('NOTIFY', {
              type: 'error',
              message: 'Unable to find bot to trade. Please contact support.'
            })
          }
          return this.log(`unable to find the bot to send the winnings offer. bot ID: ${botId}`)
        }

        bot.sendJackpotRequest(newOffer).then(offer => {
          /* send the trade offer to the client via socket */
          if (socket) {
            setTimeout(() => {
              socket.emit('JACKPOT_OFFER', offer)
            }, 10 * 1000) // wait till client side animation takes place
          }
          newOffer.setTradeId(offer.id)
        }).catch(error => {
          this.log(`error while handling jackpot winnings: ${error.message}`)
        })
      }).catch(error => {
        this.log(`error while handling jackpot winnings: ${error.message}`)
      })
    }).catch(error => {
      this.log(`error while handling jackpot winnings: ${error.message}`)
    })
  }

  createNewRound() {
    this.hasTimerStarted = false
    new JackpotRound({
      currentRound: true
    }).save().then(jackpotRound => {
      this.currentRound = jackpotRound
      this.publicIo.emit('JACKPOT_NEW_ROUND', jackpotRound.toCleanObject())
    })
  }

  cancelJackpotOffer({ tradeId, botId }) {
    return new Promise((resolve, reject) => {
      if (!tradeId) {
        return reject(new Error('No trade ID specified in jackpot offer'))
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

  cancelOfferIfOutstanding(jackpotOffer) {
    JackpotOffer.findById(jackpotOffer._id).exec().then(offer => {
      if (!offer.completed && !offer.failed) {
        offer.setFailed('Time out 2 minutes')
        this.cancelJackpotOffer(offer).catch(error => {
          this.log(`error canceling steam offer: ${error.message}`)
        })
      }
    })
  }

}

export { JackpotManager }
