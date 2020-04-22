import { JackpotRound } from '../../../db'
import { jackpot } from '../../../managers'
import config from '../../../../config'

export default function configure(socket, io) {

  socket.on('JACKPOT_LOAD', (data, callback) => {
    const currentRound = jackpot.currentRound ? jackpot.currentRound.toCleanObject() : null
    JackpotRound.getRecentRounds(config.jackpot.numberOfPastRounds).then(rounds => {
      callback({
        currentRound,
        historyRounds: rounds
      })
    }).catch(error => callback({ error: error.message }))
  })

  socket.on('JACKPOT_LOAD_STATS', (days, callback) => {
    if (!days) {
      return callback(0.00)
    }
    JackpotRound.getTotalWonInDays(days).then(callback).catch(err => callback({ error: err.message }))
  })

}
