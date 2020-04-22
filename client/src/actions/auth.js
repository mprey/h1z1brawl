import { checkHttpStatus } from '../util/network'
import jwtDecode from 'jwt-decode'
import { secureSocket } from '../'

import { AUTH_USER_LOAD_REQUEST, AUTH_USER_LOAD_SUCCESS, AUTH_USER_LOAD_FAILURE, AUTH_USER_LOGOUT, AUTH_USER_RELOAD } from '../constants'

export function reloadAuth() {
  return (dispatch) => {
    dispatch(authReload())
    return fetch('/api/auth/reload', {
      method: 'get',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      })
      .then(checkHttpStatus)
      .then(response => response.json())
      .then(response => {
        try {
          // eslint-disable-next-line
          let attempt = jwtDecode(response.token)
          dispatch(authSuccess(response.token, response))
          setTimeout(() => window.location.reload(true), 1000)
        } catch (e) {
          dispatch(authFailure({
            response: {
              status: 401,
              statusText: 'Invalid token'
            }
          }))
        }
      })
      .catch(error => {
        dispatch(authFailure({
          response: {
            status: 401,
            statusText: error
          }
        }))
      })
  }
}

export function loadAuth() {
  return (dispatch) => {
    dispatch(authRequest())
    return fetch('/api/auth/loadAuth', {
      method: 'get',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      })
      .then(checkHttpStatus)
      .then(response => response.json())
      .then(response => {
        try {
          // eslint-disable-next-line
          let attempt = jwtDecode(response.token)
          dispatch(authSuccess(response.token, response))
        } catch (e) {
          dispatch(authFailure({
            response: {
              status: 401,
              statusText: 'Invalid token'
            }
          }))
        }
      })
      .catch(error => {
        dispatch(authFailure({
          response: {
            status: 401,
            statusText: error
          }
        }))
      })
  }
}

function authRequest() {
  return {
    type: AUTH_USER_LOAD_REQUEST
  }
}

function authReload() {
  return {
    type: AUTH_USER_RELOAD
  }
}

function authSuccess(token, user) {
  localStorage.setItem('token', token)
  secureSocket.token = localStorage.getItem('token')
  secureSocket.connect()

  return {
    type: AUTH_USER_LOAD_SUCCESS,
    payload: {
      token,
      user
    }
  }
}

function logoutSuccess() {
  localStorage.removeItem('token')
  secureSocket.disconnect()

  return {
    type: AUTH_USER_LOGOUT
  }
}

export function logout() {
  return (dispatch) => {
    return fetch('/api/auth/logout')
      .then(response => {
        dispatch(logoutSuccess())
      })
      .catch(err => {
        // ignore error
      })
  }
}

function authFailure(error) {
  localStorage.removeItem('token')

  return {
    type: AUTH_USER_LOAD_FAILURE,
    payload: {
      status: error.response.status,
      statusText: error.response.statusText
    }
  }
}
