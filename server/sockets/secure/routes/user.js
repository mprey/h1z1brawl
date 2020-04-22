import { User, RakeItem } from '../../../db'
import { loadInventory, forceRefreshInventory } from '../../../actions'
import { rake } from '../../../managers'

export default function configure(socket, io) {

  socket.on('ADMIN_LOAD_RAKE', (data, callback) => {
    User.findById(socket.decoded_token.id).exec().then(user => {
      if (user.rank < 2) {
        return callback({ error: 'You do not have permission.' })
      }
      RakeItem.getAllRake().then(callback).catch(error => callback({ error: error.message }))
    }).catch(error => callback({ error: error.message }))
  })

  socket.on('ADMIN_WITHDRAW_RAKE', (rakeItem, callback) => {
    User.findById(socket.decoded_token.id).exec().then(user => {
      if (user.rank < 2) {
        return callback({ error: 'You do not have permission.' })
      }
      rake.withdrawRake(user, rakeItem).then(callback).catch(error => callback({ error: error.message }));
    })
  })

  socket.on('ADMIN_WITHDRAW_ALL_RAKE', (data, callback) => {
    User.findById(socket.decoded_token.id).exec().then(user => {
      if (user.rank < 2) {
        return callback({ error: 'You do not have permission.' })
      }
      rake.withdrawAllRake(user).then(callback).catch(error => callback({ error: error.message }));
    })
  })

  socket.on('MUTE_USER', ({ userId, reason, expiration }, callback) => {
    User.findById(socket.decoded_token.id).then(user => {
      if (user.rank < 1) {
        return callback({ error: 'You do not have permission' })
      }
      if (!userId || !reason) {
        return callback({ error: 'Invalid mute format' })
      }
      User.findById(userId).then(muted => {
        if (!muted) {
          return callback({ error: `Cannot find user ${userId}` })
        }
        const dateObject = expiration ? new Date(expiration) : null
        muted.setMuted(reason, dateObject)
        io.emit('MUTE_USER', { user: muted.name, reason, expiration })
        return callback()
      })
    }).catch(error => callback({ error: error.message }))
  })

  socket.on('BAN_USER', ({ userId, reason }, callback) => {
    User.findById(socket.decoded_token.id).then(user => {
      if (user.rank < 2) {
        return callback({ error: 'You do not have permission' })
      }
      if (!userId || !reason) {
        return callback({ error: 'Invalid ban format' })
      }
      User.findById(userId).then(banned => {
        if (!banned) {
          return callback({ error: `Cannot find user ${userId}` })
        } else if (banned.rank >= 2) {
          return callback({ error: 'You cannot ban an admin' })
        }
        banned.setBanned(reason)
        io.emit('BAN_USER', { user: banned.name, reason })
        return callback()
      })
    }).catch(error => callback({ error: error.message }))
  })

  socket.on('FORCE_REQUEST_INVENTORY', (data, callback) => {
    forceRefreshInventory(socket.decoded_token.id)
      .then(callback)
      .catch(error => callback({ error: error.message }))
  })

  socket.on('REQUEST_INVENTORY', (data, callback) => {
    loadInventory(socket.decoded_token.id)
      .then(callback)
      .catch(error => callback({ error: error.message }))
  })

  socket.on('SAVE_TRADE_URL', (data, callback) => {
    User.findById(socket.decoded_token.id)
      .then(user => {
        user.tradeUrl = data.url
        return user.save()
      })
      .then(callback)
      .catch(error => callback({ error: error.message }))
  })

}
