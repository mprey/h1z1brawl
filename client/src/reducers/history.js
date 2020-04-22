import {
  HISTORY_LOAD_COINFLIP,
  HISTORY_LOAD_COINFLIP_SUCCESS,
  HISTORY_LOAD_COINFLIP_FAILURE,
  HISTORY_LOAD_JACKPOT,
  HISTORY_LOAD_JACKPOT_SUCCESS,
  HISTORY_LOAD_JACKPOT_FAILURE
} from '../constants'

const initialState = {
  coinflip: {
    loaded: false,
    loading: false,
    data: []
  },
  jackpot: {
    loaded: false,
    loading: false,
    data: []
  }
}

export default function reducer(state = initialState, {type, payload}) {
  switch(type) {

    case HISTORY_LOAD_COINFLIP:
      return {
        ...state,
        coinflip: {
          ...state.coinflip,
          loading: true
        }
      }
    case HISTORY_LOAD_COINFLIP_SUCCESS:
      return {
        ...state,
        coinflip: {
          ...state.coinflip,
          loaded: true,
          loading: false,
          data: payload
        }
      }
    case HISTORY_LOAD_COINFLIP_FAILURE:
      return {
        ...state,
        coinflip: {
          ...state.coinflip,
          loaded: false,
          loading: false
        }
      }

    case HISTORY_LOAD_JACKPOT:
      return {
        ...state,
        jackpot: {
          ...state.jackpot,
          loading: true
        }
      }
    case HISTORY_LOAD_JACKPOT_SUCCESS:
      return {
        ...state,
        jackpot: {
          ...state.jackpot,
          loaded: true,
          loading: false,
          data: payload
        }
      }
    case HISTORY_LOAD_JACKPOT_FAILURE:
      return {
        ...state,
        jackpot: {
          ...state.jackpot,
          loaded: false,
          loading: false
        }
      }

    default:
      return state
  }
}
