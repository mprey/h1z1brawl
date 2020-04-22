import { Coinflip, JackpotRound } from '../../../db'

const GAME_LIMIT = 100

export default function configure(socket, io) {

  socket.on('HISTORY_LOAD_COINFLIP', (data, callback) => {
    Coinflip.getRecentGames(GAME_LIMIT).then(callback).catch(error => callback({ error: error.message }))
  })

  socket.on('HISTORY_LOAD_JACKPOT', (data, callback) => {
    JackpotRound.getRecentRounds(GAME_LIMIT).then(callback).catch(error => callback({ error: error.message }))
  })

}
