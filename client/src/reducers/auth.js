import {
  AUTH_USER_LOAD_REQUEST,
  AUTH_USER_LOAD_SUCCESS,
  AUTH_USER_LOAD_FAILURE,
  AUTH_USER_LOGOUT,
  AUTH_USER_RELOAD
} from '../constants'

const initialState = {
  loaded: false,
  token: null,
  user: null,
  loading: false,
  reloading: false
}

export default function reducer(state = initialState, {type, payload}) {
  switch(type) {
    case AUTH_USER_RELOAD:
      return {
        ...state,
        reloading: true
      }
    case AUTH_USER_LOAD_FAILURE:
      return {
        ...state,
        loaded: false,
        loading: false,
        reloading: false,
        user: null,
        token: null,
      }
    case AUTH_USER_LOAD_SUCCESS:
      return {
        ...state,
        loaded: true,
        loading: false,
        reloading: false,
        user: payload.user,
        token: payload.token
      }
    case AUTH_USER_LOAD_REQUEST:
      return {
        ...state,
        loading: true,
      }
    case AUTH_USER_LOGOUT:
      return {
        ...state,
        user: null,
        token: null
      }
    default:
      return state
  }
}
