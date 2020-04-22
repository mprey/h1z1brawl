import chat from './routes/chat'
import user from './routes/user'
import coinflip from './routes/coinflip'
import jackpot from './routes/jackpot'
import { coinflip as coinflipManager, jackpot as jackpotManager } from '../../managers'

export default function connect(io) {

  coinflipManager.setSecureIo(io)
  jackpotManager.setSecureIo(io)

  io.on('connection', (socket) => {
    chat(socket, io)
    user(socket, io)
    coinflip(socket, io)
    jackpot(socket, io)
  })
}
