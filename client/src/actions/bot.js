import config from '../../../config'
import { NotificationManager } from 'react-notifications'
import {
    ADD_BOT,
    ADD_BOT_SUCCESS,
    ADD_BOT_FAILURE,
    REMOVE_BOT,
    REMOVE_BOT_SUCCESS,
    REMOVE_BOT_FAILURE
} from '../constants'

export function addBot(accountName, password, sharedSecret, identitySecret) {
    return {
        type: config.socket.secure.param,
        types: [ADD_BOT, ADD_BOT_SUCCESS, ADD_BOT_FAILURE],
        promise: (socket) => socket.emit('ADD_BOT', { accountName, password, sharedSecret, identitySecret }).then(() => {
          NotificationManager.success('Successfully added bot')
        }).catch(error => {
          NotificationManager.error(`Error adding bot: ${error}`)
          throw error
        })
      }
}

export function removeBot(accountName) {
    return {
        type: config.socket.secure.param,
        types: [REMOVE_BOT, REMOVE_BOT_SUCCESS, REMOVE_BOT_FAILURE],
        promise: (socket) => socket.emit('REMOVE_BOT', { accountName }).then(() => {
          NotificationManager.success('Successfully removed bot')
        }).catch(error => {
          NotificationManager.error(`Error removing bot: ${error}`)
          throw error
        })
      }
}