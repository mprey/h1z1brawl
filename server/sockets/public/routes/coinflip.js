import { Coinflip } from '../../../db'

export default function configure(socket, io) {

  socket.on('COINFLIP_LOAD_GAMES', (data, callback) => {
    Coinflip.getOpenGames().then(callback).catch(err => callback({ error: err.message }))
  })

  socket.on('COINFLIP_LOAD_STATS', (days, callback) => {
    if (!days) {
      return callback(0.00)
    }
    Coinflip.getTotalWonInDays(days).then(callback).catch(err => callback({ error: err.message }))
  })

  socket.on('COINFLIP_LOAD_HISTORY', (data, callback) => {
    Coinflip.getRecentGames(10).then(callback).catch(err => callback({ error: err.message }))
  })

}
