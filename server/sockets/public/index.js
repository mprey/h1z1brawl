import chat from './routes/chat'
import coinflip from './routes/coinflip'
import jackpot from './routes/jackpot'
import history from './routes/history'
import { coinflip as coinflipManager, jackpot as jackpotManager } from '../../managers'

export default function connect(io) {

  coinflipManager.setPublicIo(io)
  jackpotManager.setPublicIo(io)

  io.on('connection', (socket) => {

    io.emit('USERS_CONNECTED', Object.keys(io.sockets.sockets).length)

    socket.on('GET_USERS_CONNECTED', (data, callback) => {
      callback(Object.keys(io.sockets.sockets).length)
    })

    socket.on('disconnect', () => {
      io.emit('USERS_CONNECTED', Object.keys(io.sockets.sockets).length)
    })

    chat(socket, io)
    coinflip(socket, io)
    jackpot(socket, io)
    history(socket, io)
  })
}
