import config from '../../../config'
import { NotificationManager } from 'react-notifications'
import {
  SAVE_TRADE_URL_SUCCESS,
  SAVE_TRADE_URL_FAILURE,
  SAVE_TRADE_URL_REQUEST,
  REQUEST_INVENTORY,
  REQUEST_INVENTORY_SUCCESS,
  REQUEST_INVENTORY_FAILURE,
  FORCE_REQUEST_INVENTORY,
  MUTE_USER,
  MUTE_USER_SUCCESS,
  MUTE_USER_FAILURE,
  BAN_USER,
  BAN_USER_SUCCESS,
  BAN_USER_FAILURE
} from '../constants'

export function banUser(userId, reason) {
  return {
    type: config.socket.secure.param,
    types: [BAN_USER, BAN_USER_SUCCESS, BAN_USER_FAILURE],
    promise: (socket) => socket.emit('BAN_USER', { userId, reason }).catch(error => {
      NotificationManager.error(`Error banning user: ${error}`)
      throw error
    })
  }
}

export function muteUser(userId, reason, expiration) {
  return {
    type: config.socket.secure.param,
    types: [MUTE_USER, MUTE_USER_SUCCESS, MUTE_USER_FAILURE],
    promise: (socket) => socket.emit('MUTE_USER', { userId, reason, expiration }).catch(error => {
      NotificationManager.error(`Error banning user: ${error}`)
      throw error
    })
  }
}

export function saveTradeURL(url) {
  return {
    type: config.socket.secure.param,
    types: [SAVE_TRADE_URL_REQUEST, SAVE_TRADE_URL_SUCCESS, SAVE_TRADE_URL_FAILURE],
    promise: (socket) => socket.emit('SAVE_TRADE_URL', { url })
  }
}

export function requestInventory() {
  return {
    type: config.socket.secure.param,
    types: [REQUEST_INVENTORY, REQUEST_INVENTORY_SUCCESS, REQUEST_INVENTORY_FAILURE],
    promise: (socket) => socket.emit('REQUEST_INVENTORY')
  }
}

export function forceRefreshInventory() {
  return {
    type: config.socket.secure.param,
    types: [FORCE_REQUEST_INVENTORY, REQUEST_INVENTORY_SUCCESS, REQUEST_INVENTORY_FAILURE],
    promise: (socket) => socket.emit('FORCE_REQUEST_INVENTORY')
      .catch(err => {
        if (err.ttl) {
          NotificationManager.error(err.ttl)
          throw null
        }
        throw err
      })
  }
}
