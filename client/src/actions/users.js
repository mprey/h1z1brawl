import config from '../../../config'
import { USERS_CONNECTED_REQUEST, USERS_CONNECTED_FAILURE, USERS_CONNECTED_SUCCESS } from '../constants'

export function getConnectedUsers() {
  return {
    type: config.socket.public.param,
    types: [USERS_CONNECTED_REQUEST, USERS_CONNECTED_SUCCESS, USERS_CONNECTED_FAILURE],
    promise: (socket) => socket.emit('GET_USERS_CONNECTED', {})
  }
}

export function updateConnectedUsers(users) {
  return {
    type: USERS_CONNECTED_SUCCESS,
    payload: users
  }
}
