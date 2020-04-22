import './static/index.css'

import React from 'react'
import ReactDOM from 'react-dom'
import { ConnectedRouter } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'
import { Provider } from 'react-redux'

import configureStore from './store/configureStore'
import config from '../../config'
import { App } from './containers'
import { default as SocketClient } from './util/socketClient'

const publicSocket = new SocketClient({ host: config.api.url })
const secureSocket = new SocketClient({ host: config.api.url, path: config.socket.secure.path, reconnect: false, delayConnect: true })

const initialState = window.__INITIAL_STATE__
const app = document.getElementById('root')
const history = createHistory()
const store = configureStore(initialState, history, [
  {
    param: config.socket.public.param,
    socket: publicSocket
  }, {
    param: config.socket.secure.param,
    socket: secureSocket
  }
])

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App publicSocket={publicSocket} secureSocket={secureSocket} />
    </ConnectedRouter>
  </Provider>,
  app
)

export { secureSocket, publicSocket }
