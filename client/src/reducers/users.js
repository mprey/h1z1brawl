import { USERS_CONNECTED_REQUEST, USERS_CONNECTED_FAILURE, USERS_CONNECTED_SUCCESS } from '../constants'

const initialState = {
  count: 0,
  loaded: false,
  loading: false
}

export default function reducer(state = initialState, { type, payload }) {
  switch(type) {
    case USERS_CONNECTED_REQUEST:
      return {
        ...state,
        loading: true
      }
    case USERS_CONNECTED_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: false
      }
    case USERS_CONNECTED_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        count: payload
      }
    default:
      return state
  }
}
