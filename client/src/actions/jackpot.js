import config from '../../../config'
import { NotificationManager } from 'react-notifications'
import {
  JACKPOT_DEPOSIT_ITEMS,
  JACKPOT_DEPOSIT_ITEMS_SUCCESS,
  JACKPOT_DEPOSIT_ITEMS_FAILURE,
  JACKPOT_UPDATE_ROUND,
  JACKPOT_NEW_ROUND,
  JACKPOT_END_ROUND,
  JACKPOT_FINISH_ROLLING,
  JACKPOT_LOAD,
  JACKPOT_LOAD_SUCCESS,
  JACKPOT_LOAD_FAILURE,
  JACKPOT_START_ROLLING,
  JACKPOT_LOAD_STATS,
  JACKPOT_LOAD_STATS_SUCCESS,
  JACKPOT_LOAD_STATS_FAILURE,
  JACKPOT_ADMIN_LOAD_OFFERS,
  JACKPOT_ADMIN_LOAD_OFFERS_SUCCESS,
  JACKPOT_ADMIN_LOAD_OFFERS_FAILURE,
  JACKPOT_ADMIN_RESEND_OFFER,
  JACKPOT_ADMIN_RESEND_OFFER_SUCCESS,
  JACKPOT_ADMIN_RESEND_OFFER_FAILURE
} from '../constants'

export function resendJackpotOffer(offer) {
  return {
    type: config.socket.secure.param,
    types: [JACKPOT_ADMIN_RESEND_OFFER, JACKPOT_ADMIN_RESEND_OFFER_SUCCESS, JACKPOT_ADMIN_RESEND_OFFER_FAILURE],
    promise: (socket) => socket.emit('JACKPOT_ADMIN_RESEND_OFFER', offer).then(data => {
      NotificationManager.info('Resent jackpot offer successfully.')
    }).catch(error => {
      NotificationManager.error(`Error resending jackpot offer: ${error}`)
      throw error
    })
  }
}

export function loadJackpotOffers() {
  return {
    type: config.socket.secure.param,
    types: [JACKPOT_ADMIN_LOAD_OFFERS, JACKPOT_ADMIN_LOAD_OFFERS_SUCCESS, JACKPOT_ADMIN_LOAD_OFFERS_FAILURE],
    promise: (socket) => socket.emit('JACKPOT_ADMIN_GET_OFFERS').catch(error => {
      NotificationManager.error(`Error loading jackpot offers: ${error}`)
      throw error
    })
  }
}

export function loadJackpotStats(days) {
  return {
    type: config.socket.public.param,
    types: [JACKPOT_LOAD_STATS, JACKPOT_LOAD_STATS_SUCCESS, JACKPOT_LOAD_STATS_FAILURE],
    promise: (socket) => socket.emit('JACKPOT_LOAD_STATS', days)
  }
}

export function startJackpotRolling(roundId) {
  return {
    type: JACKPOT_START_ROLLING,
    payload: roundId
  }
}

export function loadJackpot() {
  return {
    type: config.socket.public.param,
    types: [JACKPOT_LOAD, JACKPOT_LOAD_SUCCESS, JACKPOT_LOAD_FAILURE],
    promise: (socket) => socket.emit('JACKPOT_LOAD').catch(error => {
      NotificationManager.error(`Error loading jackpot: ${error.message}`)
      throw error
    })
  }
}

export function depositJackpotItems(items) {
  return {
    type: config.socket.secure.param,
    types: [JACKPOT_DEPOSIT_ITEMS, JACKPOT_DEPOSIT_ITEMS_SUCCESS, JACKPOT_DEPOSIT_ITEMS_FAILURE],
    promise: (socket) => socket.emit('JACKPOT_DEPOSIT_ITEMS', items).then(result => {
      NotificationManager.info('Deposited jackpot items. Waiting for trade offer...')
    }).catch(error => {
      NotificationManager.error(`Error depositing items: ${error.message}`)
      throw error
    })
  }
}

export function endJackpotRolling() {
  return {
    type: JACKPOT_FINISH_ROLLING
  }
}

export function endJackpotRound(round) {
  return {
    type: JACKPOT_END_ROUND,
    payload: round
  }
}

export function newJackpotRound(round) {
  return {
    type: JACKPOT_NEW_ROUND,
    payload: round
  }
}

export function updateJackpotRound(round) {
  return {
    type: JACKPOT_UPDATE_ROUND,
    payload: round
  }
}
