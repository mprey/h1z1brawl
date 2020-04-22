import io from 'socket.io-client'

export default class SocketClient { //maybe make two socket instances? secureSocket and publicSocket? for different messages

  constructor({ host, path, token, reconnect, delayConnect }) {
    this.host = host
    this.path = path
    this.token = token
    this.reconnect = (reconnect ? reconnect : true)
    //eslint-disable-next-line
    delayConnect ? null : this.connect()

    this.off = this.off.bind(this)
  }

  connect() {
    if (this.socket) {
      this.disconnect()
    }

    this.socket = io.connect(this.host, {
      path: this.path ? this.path : '',
      query: this.token ? `token=${this.token}` : '',
      reconnection: this.reconnect
    })
    return new Promise((resolve, reject) => {
      this.socket
        .on('error', (error) => Promise.reject(error).catch(e => {}))
        .on('success', () => resolve())
    })
  }

  disconnect() {
    return new Promise((resolve) => {
      this.socket.disconnect(() => {
        this.socket = null;
        resolve()
      })
    })
  }

  emit(event, data) {
    return new Promise((resolve, reject) => {
      if (!this.socket) return Promise.reject('No socket connection.').catch(e => {})

      return this.socket.emit(event, data, (response) => {
        // Response is the optional callback that you can use with socket.io in every request. See 1 above.
        if (response && response.error) {
          return reject(response.error)
        }
        return resolve(response)
      })
    })
  }

  on(event, handle) {
    if (this.socket) {
      this.socket.on(event, handle)
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event)
    }
  }

}
