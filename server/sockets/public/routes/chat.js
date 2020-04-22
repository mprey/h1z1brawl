import { Message } from '../../../db'

const LOAD_LIMIT = 50

export default function configure(socket, io) {
  socket.on('LOAD_CHAT', (data, callback) => {
    Message.loadRecentMessages(LOAD_LIMIT)
      .then(Message.formatMessages)
      .then(callback)
      .catch(err => callback({ error: err.message }))
  })
}
