import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { routerMiddleware } from 'react-router-redux'

import reducers from '../reducers'
import socketMiddleware from '../middleware/socketMiddleware'

const createFinalStore = (history, sockets) => {
  return compose(
    applyMiddleware(
      routerMiddleware(history),
      thunk,
      socketMiddleware(sockets[0]),
      socketMiddleware(sockets[1]), logger),
  )(createStore)
}

export default function configureStore(initialState, history, sockets) {
  return createFinalStore(history, sockets)(reducers, initialState)
};
