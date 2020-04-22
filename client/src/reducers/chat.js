import { SEND_CHAT_REQUEST, SEND_CHAT_FAILURE, SEND_CHAT_SUCCESS, RECEIVE_CHAT, LOAD_CHAT_REQUEST, LOAD_CHAT_SUCCESS, LOAD_CHAT_FAILURE, DELETE_MESSAGE } from '../constants'

const initialState = {
  messages: [],
  sending: false,
  error: null,
  loaded: false,
  loading: false
}

export default function reducer(state = initialState, { type, payload }) {
  switch (type) {
    case DELETE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter((message) => message.id !== payload)
      }
    case SEND_CHAT_REQUEST:
      return {
        ...state,
        sending: true
      }
    case SEND_CHAT_FAILURE:
      return {
        ...state,
        sending: false,
        error: payload
      }
    case SEND_CHAT_SUCCESS:
      return {
        ...state,
        sending: false
      }
    case RECEIVE_CHAT:
      return {
        ...state,
        messages: [payload, ...state.messages]
      }
    case LOAD_CHAT_REQUEST:
      return {
        ...state,
        loading: true
      }
    case LOAD_CHAT_SUCCESS:
      return {
        ...state,
        loaded: true,
        loading: false,
        messages: payload
      }
    case LOAD_CHAT_FAILURE:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: payload
      }
    default:
      return state
  }
}
