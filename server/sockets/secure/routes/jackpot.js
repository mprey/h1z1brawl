
import { User, JackpotOffer } from '../../../db'
import { checkJackpotItems } from '../../../actions'
import { jackpot, bot as botManager } from '../../../managers'

export default function configure(socket, io) {

  socket.on('JACKPOT_DEPOSIT_ITEMS', (items, callback) => {
    User.findById(socket.decoded_token.id).exec().then(user => {
      user.hasTradeURL()
      checkJackpotItems(items)
      callback()
      jackpot.depositItems(user, items).then(offer => {
        socket.emit('JACKPOT_OFFER', offer)
      }).catch(error => socket.emit('JACKPOT_OFFER_ERROR', { error: error.message }))
    }).catch(error => callback({ error: error.message }))
  })

  socket.on('JACKPOT_ADMIN_GET_OFFERS', (data, callback) => {
    User.findById(socket.decoded_token.id).exec().then(user => {
      if (user.rank < 2) {
        return callback({ error: 'You do not have permission.' })
      }
      JackpotOffer.getAllOffers().then(callback).catch(error => callback({ error: error.message }))
    })
  })

  socket.on('JACKPOT_ADMIN_RESEND_OFFER', (tradeOffer, callback) => {
    User.findById(socket.decoded_token.id).exec().then(user => {
      if (user.rank < 2) {
        return callback({ error: 'You do not have permission. How did you even figure this out?' })
      }
      jackpot.resendTradeOffer(tradeOffer).then(callback).catch(error => callback({ error: error.message }))
    })
  })

}
