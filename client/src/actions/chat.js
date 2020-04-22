import config from '../../../config'
import { NotificationManager } from 'react-notifications'
import {
  SEND_CHAT_REQUEST,
  SEND_CHAT_FAILURE,
  SEND_CHAT_SUCCESS,
  RECEIVE_CHAT,
  LOAD_CHAT_REQUEST,
  LOAD_CHAT_SUCCESS,
  LOAD_CHAT_FAILURE,
  DELETE_MESSAGE,
  DELETE_MESSAGE_SUCCESS,
  DELETE_MESSAGE_FAILURE
} from '../constants'

export function deleteMessage(messageId) {
  return {
    type: config.socket.secure.param,
    types: [DELETE_MESSAGE, DELETE_MESSAGE_SUCCESS, DELETE_MESSAGE_FAILURE],
    promise: (socket) => socket.emit('DELETE_MESSAGE', messageId).then(data => {
      NotificationManager.success('Deleted message')
    }).catch(error => {
      NotificationManager.error(`Error deleting message: ${error}`)
      throw error
    })
  }
}

export function sendChat(message) {
  return {
    type: config.socket.secure.param,
    types: [SEND_CHAT_REQUEST, SEND_CHAT_SUCCESS, SEND_CHAT_FAILURE],
    promise: (socket) => socket.emit('SEND_CHAT', { message: message }).catch(error => {
      NotificationManager.error(`Error sending chat: ${error}`)
      throw error
    })
  }
}

export function loadChat() {
  return {
    type: config.socket.public.param,
    types: [LOAD_CHAT_REQUEST, LOAD_CHAT_SUCCESS, LOAD_CHAT_FAILURE],
    promise: (socket) => socket.emit('LOAD_CHAT')
  }
}

export function removeChat(messageId) {
  return {
    type: DELETE_MESSAGE,
    payload: messageId
  }
}

export function receiveChat(object) {
  return {
    type: RECEIVE_CHAT,
    payload: object
  }
}
