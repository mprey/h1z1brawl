import config from '../../../config'
import { NotificationManager } from 'react-notifications'
import {
  CREATE_COINFLIP_GAME,
  CREATE_COINFLIP_GAME_FAILURE,
  CREATE_COINFLIP_GAME_SUCCESS,
  COINFLIP_NEW_GAME,
  COINFLIP_REQUEST_OFFERS,
  COINFLIP_REQUEST_OFFERS_SUCCESS,
  COINFLIP_REQUEST_OFFERS_FAILURE,
  COINFLIP_RESEND_OFFER,
  COINFLIP_RESEND_OFFER_SUCCESS,
  COINFLIP_RESEND_OFFER_FAILURE,
  COINFLIP_CANCEL_OFFER,
  COINFLIP_CANCEL_OFFER_SUCCESS,
  COINFLIP_CANCEL_OFFER_FAILURE,
  COINFLIP_LOAD_GAMES,
  COINFLIP_LOAD_GAMES_SUCCESS,
  COINFLIP_LOAD_GAMES_FAILURE,
  COINFLIP_JOIN_GAME,
  COINFLIP_JOIN_GAME_SUCCESS,
  COINFLIP_JOIN_GAME_FAILURE,
  COINFLIP_UPDATE_GAME,
  COINFLIP_REMOVE_GAME,
  COINFLIP_LOAD_STATS,
  COINFLIP_LOAD_STATS_SUCCESS,
  COINFLIP_LOAD_STATS_FAILURE,
  COINFLIP_SET_FLIPPED,
  COINFLIP_UPDATE_HISTORY,
  COINFLIP_LOAD_HISTORY,
  COINFLIP_LOAD_HISTORY_SUCCESS,
  COINFLIP_LOAD_HISTORY_FAILURE,
  COINFLIP_ADMIN_LOAD_OFFERS,
  COINFLIP_ADMIN_LOAD_OFFERS_SUCCESS,
  COINFLIP_ADMIN_LOAD_OFFERS_FAILURE,
  COINFLIP_ADMIN_RESEND_OFFER,
  COINFLIP_ADMIN_RESEND_OFFER_SUCCESS,
  COINFLIP_ADMIN_RESEND_OFFER_FAILURE
} from '../constants'

export function resendCoinflipOffer(offer) {
  return {
    type: config.socket.secure.param,
    types: [COINFLIP_ADMIN_RESEND_OFFER, COINFLIP_ADMIN_RESEND_OFFER_SUCCESS, COINFLIP_ADMIN_RESEND_OFFER_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_ADMIN_RESEND_OFFER', offer).then(data => {
      NotificationManager.info('Resent coinflip offer successfully.')
    }).catch(error => {
      NotificationManager.error(`Error resending coinflip offer: ${error}`)
      throw error
    })
  }
}

export function loadCoinflipOffers() {
  return {
    type: config.socket.secure.param,
    types: [COINFLIP_ADMIN_LOAD_OFFERS, COINFLIP_ADMIN_LOAD_OFFERS_SUCCESS, COINFLIP_ADMIN_LOAD_OFFERS_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_ADMIN_GET_OFFERS').catch(error => {
      NotificationManager.error(`Error loading coinflip offers: ${error}`)
      throw error
    })
  }
}

export function addCoinflipHistoryGame(game) {
  return {
    type: COINFLIP_UPDATE_HISTORY,
    payload: game
  }
}

export function setCoinFlipped(id) {
  return {
    type: COINFLIP_SET_FLIPPED,
    payload: id
  }
}

export function updateCoinflipGame(game) {
  return (dispatch) => {
    dispatch(updateGame(game))
    if (game.completed) {
      setTimeout(() => {
        dispatch(removeGame(game)) /* remove the coinflip game from client side if it's completed (after 1 minute) */
      }, 30 * 1000)
    }
  }
}

export function removeCoinflipGame(game) {
  return {
    type: COINFLIP_REMOVE_GAME,
    payload: game
  }
}

function updateGame(game) {
  return {
    type: COINFLIP_UPDATE_GAME,
    payload: game
  }
}

function removeGame(game) {
  return {
    type: COINFLIP_REMOVE_GAME,
    payload: game
  }
}

export function joinCoinflipGame(data) {
  return {
    type: config.socket.secure.param,
    types: [COINFLIP_JOIN_GAME, COINFLIP_JOIN_GAME_SUCCESS, COINFLIP_JOIN_GAME_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_JOIN_GAME', data).then(data => {
      NotificationManager.info('Coinflip game joined. Waiting for trade offer...')
    }).catch(error => {
      NotificationManager.error(`Error joining game: ${error}`)
      throw error
    })
  }
}

export function loadCoinflipGames() {
  return (dispatch) => {
    dispatch(loadCurrentGames())
    dispatch(loadHistoryGames())
  }
}

function loadCurrentGames() {
  return {
    type: config.socket.public.param,
    types: [COINFLIP_LOAD_GAMES, COINFLIP_LOAD_GAMES_SUCCESS, COINFLIP_LOAD_GAMES_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_LOAD_GAMES').catch(error => {
      NotificationManager.error(`Error loading coinflip: ${error}`)
      throw error
    })
  }
}

function loadHistoryGames() {
  return {
    type: config.socket.public.param,
    types: [COINFLIP_LOAD_HISTORY, COINFLIP_LOAD_HISTORY_SUCCESS, COINFLIP_LOAD_HISTORY_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_LOAD_HISTORY').catch(error => {
      NotificationManager.error(`Error loading coinflip history: ${error}`)
      throw error
    })
  }
}

export function createCoinflipGame(data) {
  return {
    type: config.socket.secure.param,
    types: [CREATE_COINFLIP_GAME, CREATE_COINFLIP_GAME_SUCCESS, CREATE_COINFLIP_GAME_FAILURE],
    promise: (socket) => socket.emit('CREATE_COINFLIP_GAME', data)
      .then(data => {
        NotificationManager.info('Coinflip game created. Waiting for trade offer...')
      })
      .catch(err => {
        NotificationManager.error(`Error while creating: ${err.toString()}`, 'Coinflip')
        throw err
      })
  }
}

export function cancelCoinflipOffer(offer) {
  return {
    type: config.socket.secure.param,
    types: [COINFLIP_CANCEL_OFFER, COINFLIP_CANCEL_OFFER_SUCCESS, COINFLIP_CANCEL_OFFER_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_CANCEL_OFFER', offer).then(data => {
      NotificationManager.info('Coinflip offer canceled')
    }).catch(error => {
      NotificationManager.error(`Error canceling coinflip offer: ${error}`)
      throw error
    })
  }
}

export function requestCoinflipOffers() {
  return {
    type: config.socket.secure.param,
    types: [COINFLIP_REQUEST_OFFERS, COINFLIP_REQUEST_OFFERS_SUCCESS, COINFLIP_REQUEST_OFFERS_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_REQUEST_OFFERS').catch(error => {
      NotificationManager.error(`Error while requesting offers: ${error}`)
      throw error
    })
  }
}

export function receiveCoinflipOffers(offers) {
  return {
    type: COINFLIP_REQUEST_OFFERS_SUCCESS,
    payload: offers
  }
}

export function loadCoinflipStats(days) {
  return {
    type: config.socket.public.param,
    types: [COINFLIP_LOAD_STATS, COINFLIP_LOAD_STATS_SUCCESS, COINFLIP_LOAD_STATS_FAILURE],
    promise: (socket) => socket.emit('COINFLIP_LOAD_STATS', days)
  }
}

export function addCoinflipGame(game) {
  return {
    type: COINFLIP_NEW_GAME,
    payload: game
  }
}
