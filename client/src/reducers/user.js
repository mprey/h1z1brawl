import {
  REQUEST_INVENTORY,
  REQUEST_INVENTORY_SUCCESS,
  REQUEST_INVENTORY_FAILURE,
  SAVE_TRADE_URL_SUCCESS,
  SAVE_TRADE_URL_FAILURE,
  SAVE_TRADE_URL_REQUEST,
  AUTH_USER_RELOAD,
  FORCE_REQUEST_INVENTORY
} from '../constants'

const initialState = {
  tradeUrlLoading: false,
  forceRefresh: false,
  inventory: {
    loading: false,
    loaded: false,
    error: null,
    items: []
  }
}

export default function reducer(state = initialState, {type, payload}) {
  switch (type) {
    case SAVE_TRADE_URL_REQUEST:
      return {
        ...state,
        tradeUrlLoading: true
      }
    case SAVE_TRADE_URL_SUCCESS:
      return {
        ...state,
        forceRefresh: true
      }
    case SAVE_TRADE_URL_FAILURE:
      return {
        ...state
      }
    case AUTH_USER_RELOAD:
      return {
        ...state,
        forceRefresh: false
      }
    case REQUEST_INVENTORY:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          loading: true
        }
      }
    case REQUEST_INVENTORY_SUCCESS:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          loaded: true,
          loading: false,
          error: null,
          items: payload
        }
      }
    case REQUEST_INVENTORY_FAILURE:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          loaded: false,
          loading: false,
          error: payload
        }
      }
    case FORCE_REQUEST_INVENTORY:
      return {
        ...state,
        inventory: {
          ...state.inventory,
          loading: true
        }
      }
    default:
      return state
  }
}
