import { User, Message } from '../../../db'
import moment from 'moment'

export default function configure(socket, io) {

  socket.on('SEND_CHAT', (data, callback) => {
    User.findById(socket.decoded_token.id)
      .then(user => { //TODO check if user is muted or something
        if (user.isMuted()) {
          if (user.mute.expiration) {
            return callback({ error: `You are muted for ${user.mute.reason} for ${moment(new Date(user.mute.expiration)).fromNow(true)}` })
          }
          return callback({ error: `You are muted permanently for ${user.mute.reason}` })
        }
        const message = new Message({
          senderId: user._id,
          message: data.message
        })
        return message.save()
      })
      .then(message => message.formatMessage())
      .then(message => {
        io.emit('RECEIVE_CHAT', message)
        callback()
      })
      .catch(err => callback({ error: err.message }))
  })

  socket.on('DELETE_MESSAGE', (messageId, callback) => {
    User.findById(socket.decoded_token.id).then(user => {
      if (user.rank < 1) {
        return callback({ error: 'You do not have permission' })
      }
      Message.remove({ _id: messageId }).then(data => {
        io.emit('DELETE_MESSAGE', messageId)
        callback()
      }).catch(error => callback({ error: error.message }))
    }).catch(error => callback({ error: error.message }))
  })

}
