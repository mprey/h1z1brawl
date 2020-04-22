import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { NotificationContainer, NotificationManager } from 'react-notifications'
import { saveTradeURL as tradeURLAction, loadAuth, reloadAuth, updateConnectedUsers } from '../../actions'
import { Header, TradeURLModal } from '../../components'
import { Chat, Landing } from '../index'
import Routes from '../../routes'
import { isTradeURL } from '../../util/url'
import config from '../../../../config'

import './App.css'
import 'react-notifications/lib/notifications.css';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'
import 'semantic-ui-css/semantic.min.css';
import background from '../../static/bg.jpg'
import cube from '../../static/cube.svg'

class App extends Component {

  constructor(props) {
    super(props)

    this.saveTradeURL = this.saveTradeURL.bind(this)

    this.state = {
      tradeUrlModal: false
    }
  }

  componentWillMount() {
    if (!this.props.auth.loaded) {
      this.props.loadAuth()
    }

    this.props.publicSocket.on('NOTIFY', this.notify)
    this.props.secureSocket.on('NOTIFY', this.notify)
    this.props.publicSocket.on('USERS_CONNECTED', this.props.updateConnectedUsers)
  }

  componentWillUnmount() {
    this.props.publicSocket.off('NOTIFY')
    this.props.secureSocket.off('NOTIFY')
    this.props.publicSocket.off('USERS_CONNECTED')
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.auth.user && nextProps.auth.user) {
      setTimeout(() => {
        this.setState({
          tradeUrlModal: !nextProps.auth.user.tradeUrl
        })
      }, 1000)
    }

    if (nextProps.userState.forceRefresh && !this.props.auth.reloading) {
      this.props.reloadAuth()
      NotificationManager.success('Trade URL saved successfully')
      this.setState({
        tradeUrlModal: false
      })
    }

  }

  saveTradeURL({ inputRef: { value } }) {
    if (!value || !isTradeURL(value)) {
      NotificationManager.error('Enter a valid trade URL')
      return;
    }
    this.props.tradeURLAction(value)
  }

  notify({ type, message, header }) {
    switch(type) {
      case 'error':
        NotificationManager.error(message, header)
        break
      case 'info':
        NotificationManager.info(message, header)
        break
      case 'warning':
        NotificationManager.warning(message, header)
        break
      case 'success':
        NotificationManager.success(message, header)
        break
    }
  }

  render() {
    const { user, loading } = this.props.auth

    if (user && user.ban && user.ban.isBanned) {
      return <p>You are banned for {user.ban.reason}.</p>
    }

    return (
      <div className="App">
        { loading ? (
            <div className="App__Loading">
              <img src={cube} alt="loading" />
            </div>
          ) : (
            <div>
              {!user && config.metadata.useLanding && 
                <Landing />
              }
              <Header user={user} onSettingsClick={() => this.setState({ tradeUrlModal: true })} />
              <Chat secureSocket={this.props.secureSocket} />
              <Routes secureSocket={this.props.secureSocket} publicSocket={this.props.publicSocket} />
              <div className="App__Background noselect">
                <img src={background} alt="background" />
                <div className="App__Background-Wrapper"></div>
              </div>
              <TradeURLModal userState={this.props.userState} onClick={this.saveTradeURL} isOpen={this.state.tradeUrlModal} close={() => this.setState({tradeUrlModal: false})} />
            </div>
          ) }
          <NotificationContainer />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth,
    userState: state.user,
    notify: state.notify
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadAuth,
    tradeURLAction,
    reloadAuth,
    updateConnectedUsers
  }, dispatch)
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(App))
