import {
  ADMIN_LOAD_RAKE,
  ADMIN_LOAD_RAKE_SUCCESS,
  ADMIN_LOAD_RAKE_FAILURE
} from '../constants'

const initialState = {
  rake: {
    loaded: false,
    loading: false,
    data: []
  }
}

export default function reducer(state = initialState, {type, payload}) {
  switch(type) {
    case ADMIN_LOAD_RAKE:
      return {
        ...state,
        rake: {
          loaded: false,
          loading: true,
        }
      }
    case ADMIN_LOAD_RAKE_SUCCESS:
      return {
        ...state,
        rake: {
          loaded: true,
          loading: false,
          data: payload
        }
      }
    case ADMIN_LOAD_RAKE_FAILURE:
      return {
        ...state,
        rake: {
          loaded: false,
          loading: false,
          data: []
        }
      }
    default:
      return state
  }
}
