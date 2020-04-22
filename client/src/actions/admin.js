import config from '../../../config'
import { NotificationManager } from 'react-notifications'

import {
  ADMIN_LOAD_RAKE,
  ADMIN_LOAD_RAKE_SUCCESS,
  ADMIN_LOAD_RAKE_FAILURE,
  ADMIN_WITHDRAW_RAKE,
  ADMIN_WITHDRAW_RAKE_SUCCESS,
  ADMIN_WITHDRAW_RAKE_FAILURE
} from '../constants'

export function withdrawAllRake() {
  return {
    type: config.socket.secure.param,
    types: [ADMIN_WITHDRAW_RAKE, ADMIN_WITHDRAW_RAKE_SUCCESS, ADMIN_WITHDRAW_RAKE_FAILURE],
    promise: (socket) => socket.emit('ADMIN_WITHDRAW_ALL_RAKE').then(data => {
      NotificationManager.success('Sent trade offer for all rake items to your account.')
    }).catch(error => {
      NotificationManager.error(`Error while withdrawing rake: ${error}`)
      throw error
    })
  }
}

export function withdrawRake(rakeItem) {
  return {
    type: config.socket.secure.param,
    types: [ADMIN_WITHDRAW_RAKE, ADMIN_WITHDRAW_RAKE_SUCCESS, ADMIN_WITHDRAW_RAKE_FAILURE],
    promise: (socket) => socket.emit('ADMIN_WITHDRAW_RAKE', rakeItem).then(data => {
      NotificationManager.success('Sent trade offer for rake items to your account.')
    }).catch(error => {
      NotificationManager.error(`Error while withdrawing rake: ${error}`)
      throw error
    })
  }
}

export function loadRakeHistory() {
  return {
    type: config.socket.secure.param,
    types: [ADMIN_LOAD_RAKE, ADMIN_LOAD_RAKE_SUCCESS, ADMIN_LOAD_RAKE_FAILURE],
    promise: (socket) => socket.emit('ADMIN_LOAD_RAKE').catch(error => {
      NotificationManager.error(`Error while loading rake: ${error}`)
      throw error
    })
  }
}
