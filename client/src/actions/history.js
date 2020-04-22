import config from '../../../config'
import { NotificationManager } from 'react-notifications'

import {
  HISTORY_LOAD_COINFLIP,
  HISTORY_LOAD_COINFLIP_SUCCESS,
  HISTORY_LOAD_COINFLIP_FAILURE,
  HISTORY_LOAD_JACKPOT,
  HISTORY_LOAD_JACKPOT_SUCCESS,
  HISTORY_LOAD_JACKPOT_FAILURE
} from '../constants'

export function historyLoadCoinflip() {
  return {
    type: config.socket.public.param,
    types: [HISTORY_LOAD_COINFLIP, HISTORY_LOAD_COINFLIP_SUCCESS, HISTORY_LOAD_COINFLIP_FAILURE],
    promise: (socket) => socket.emit('HISTORY_LOAD_COINFLIP').catch(error => {
      NotificationManager.error(`Error loading coinflip history: ${error}`)
      throw error
    })
  }
}

export function historyLoadJackpot() {
  return {
    type: config.socket.public.param,
    types: [HISTORY_LOAD_JACKPOT, HISTORY_LOAD_JACKPOT_SUCCESS, HISTORY_LOAD_JACKPOT_FAILURE],
    promise: (socket) => socket.emit('HISTORY_LOAD_JACKPOT').catch(error => {
      NotificationManager.error(`Error loading jackpot history: ${error}`)
      throw error
    })
  }
}
