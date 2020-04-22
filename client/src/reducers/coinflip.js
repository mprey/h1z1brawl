import {
  CREATE_COINFLIP_GAME,
  CREATE_COINFLIP_GAME_FAILURE,
  CREATE_COINFLIP_GAME_SUCCESS,
  COINFLIP_NEW_GAME,
  COINFLIP_REQUEST_OFFERS,
  COINFLIP_REQUEST_OFFERS_SUCCESS,
  COINFLIP_REQUEST_OFFERS_FAILURE,
  COINFLIP_LOAD_GAMES,
  COINFLIP_LOAD_GAMES_SUCCESS,
  COINFLIP_LOAD_GAMES_FAILURE,
  COINFLIP_JOIN_GAME,
  COINFLIP_JOIN_GAME_SUCCESS,
  COINFLIP_JOIN_GAME_FAILURE,
  COINFLIP_RESEND_OFFER,
  COINFLIP_RESEND_OFFER_SUCCESS,
  COINFLIP_RESEND_OFFER_FAILURE,
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

const initialState = {
  loading: false,
  loaded: false,
  creatingGame: false,
  games: [],
  historyGames: [],
  historyLoading: false,
  flippedGames: [],
  resending: false,
  offers: {
    loaded: false,
    loading: false,
    offers: []
  },
  stats: {
    loaded: false,
    loading: false,
    won: null
  },
  joiningGame: false,
  admin: {
    offers: {
      loaded: false,
      loading: false,
      data: null,
      resending: false,
    }
  }
}

export default function reducer(state = initialState, {type, payload}) {
  switch (type) {
    case COINFLIP_ADMIN_RESEND_OFFER_FAILURE:
      return {
        ...state,
        admin: {
          ...state.admin,
          offers: {
            ...state.admin.offers,
            resending: false
          }
        }
      }
    case COINFLIP_ADMIN_RESEND_OFFER_SUCCESS:
      return {
        ...state,
        admin: {
          ...state.admin,
          offers: {
            ...state.admin.offers,
            resending: false
          }
        }
      }
    case COINFLIP_ADMIN_RESEND_OFFER:
      return {
        ...state,
        admin: {
          ...state.admin,
          offers: {
            ...state.admin.offers,
            resending: true
          }
        }
      }
    case COINFLIP_ADMIN_LOAD_OFFERS:
      return {
        ...state,
        admin: {
          ...state.admin,
          offers: {
            ...state.admin.offers,
            loaded: false,
            loading: true
          }
        }
      }
    case COINFLIP_ADMIN_LOAD_OFFERS_FAILURE:
      return {
        ...state,
        admin: {
          ...state.admin,
          offers: {
            ...state.admin.offers,
            loaded: false,
            loading: false,
            data: null
          }
        }
      }
    case COINFLIP_ADMIN_LOAD_OFFERS_SUCCESS:
      return {
        ...state,
        admin: {
          ...state.admin,
          offers: {
            ...state.admin.offers,
            loaded: true,
            loading: false,
            data: payload
          }
        }
      }
    case COINFLIP_LOAD_HISTORY:
      return {
        ...state,
        historyLoading: true
      }
    case COINFLIP_LOAD_HISTORY_SUCCESS:
      return {
        ...state,
        historyGames: payload,
        historyLoading: false
      }
    case COINFLIP_LOAD_HISTORY_FAILURE:
      return {
        ...state,
        historyGames: [],
        historyLoading: false
      }
    case COINFLIP_UPDATE_HISTORY:
      return {
        ...state,
        historyGames: [payload, ...state.historyGames.slice(0, 8)]
      }
    case COINFLIP_SET_FLIPPED:
      return {
        ...state,
        flippedGames: [...state.flippedGames, payload]
      }
    case COINFLIP_LOAD_STATS:
      return {
        ...state,
        stats: {
          loaded: false,
          loading: true,
          won: null
        }
      }
    case COINFLIP_LOAD_STATS_SUCCESS:
      return {
        ...state,
        stats: {
          loaded: true,
          loading: false,
          won: payload
        }
      }
    case COINFLIP_LOAD_STATS_FAILURE:
      return {
        ...state,
        stats: {
          loaded: false,
          loading: false,
          won: payload
        }
      }
    case COINFLIP_UPDATE_GAME:
      return {
        ...state,
        games: state.games.map((game) => (game._id === payload._id) ? payload : game)
      }
    case COINFLIP_REMOVE_GAME:
      return {
        ...state,
        games: state.games.filter((game) => game._id !== payload._id),
        flippedGames: state.flippedGames.filter((id) => id !== payload._id)
      }
    case COINFLIP_RESEND_OFFER:
      return {
        ...state,
        resending: true
      }
    case COINFLIP_RESEND_OFFER_SUCCESS:
      return {
        ...state,
        resending: false
      }
    case COINFLIP_RESEND_OFFER_FAILURE:
      return {
        ...state,
        resending: false
      }
    case COINFLIP_JOIN_GAME:
      return {
        ...state,
        joiningGame: true
      }
    case COINFLIP_JOIN_GAME_SUCCESS:
      return {
        ...state,
        joiningGame: false
      }
    case COINFLIP_JOIN_GAME_FAILURE:
      return {
        ...state,
        joiningGame: false
      }
    case COINFLIP_LOAD_GAMES:
      return {
        ...state,
        loading: true,
        loaded: false
      }
    case COINFLIP_LOAD_GAMES_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        games: payload
      }
    case COINFLIP_LOAD_GAMES_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: false,
        games: []
      }
    case CREATE_COINFLIP_GAME:
      return {
        ...state,
        creatingGame: true
      }
    case CREATE_COINFLIP_GAME_SUCCESS:
      return {
        ...state,
        creatingGame: false
      }
    case CREATE_COINFLIP_GAME_FAILURE:
      return {
        ...state,
        creatingGame: false
      }
    case COINFLIP_NEW_GAME:
      return {
        ...state,
        games: state.games.concat(payload)
      }
    case COINFLIP_REQUEST_OFFERS:
      return {
        ...state,
        offers: {
          ...state.offers,
          loading: true
        }
      }
    case COINFLIP_REQUEST_OFFERS_SUCCESS:
      return {
        ...state,
        offers: {
          loaded: true,
          loading: false,
          offers: payload
        }
      }
    case COINFLIP_REQUEST_OFFERS_FAILURE:
      return {
        ...state,
        offers: {
          ...state.offers,
          loaded: false,
          loading: false
        }
      }
    default:
      return state
  }
}
