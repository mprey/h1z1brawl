import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { NotificationManager } from 'react-notifications'
import FontAwesome from 'react-fontawesome'
import { Popup } from 'semantic-ui-react'
import { Message } from '../../components'
import { sendChat, receiveChat, loadChat, deleteMessage, banUser, muteUser, removeChat, addBot, removeBot } from '../../actions/'
import { api } from '../../../../config'
import { futureDateFromText, getCommandProperties } from '../../util/chat'
import logo from '../../static/logo.png'
import moment from 'moment'
import config from '../../../../config'

import FourHead from '../../static/emotes/4Head.png'
import ANELE from '../../static/emotes/ANELE.png'
import BabyRage from '../../static/emotes/BabyRage.png'
import BibleThump from '../../static/emotes/BibleThump.png'
import BrokeBack from '../../static/emotes/BrokeBack.png'
import cmonBruh from '../../static/emotes/cmonBruh.png'
import CoolCat from '../../static/emotes/CoolCat.png'
import CorgiDerp from '../../static/emotes/CorgiDerp.png'
import EleGiggle from '../../static/emotes/EleGiggle.png'
import FailFish from '../../static/emotes/FailFish.png'
import FeelsBadMan from '../../static/emotes/FeelsBadMan.png'
import FeelsGoodMan from '../../static/emotes/FeelsGoodMan.png'
import Kappa from '../../static/emotes/Kappa.png'
import Kreygasm from '../../static/emotes/Kreygasm.png'
import MrDestructoid from '../../static/emotes/MrDestructoid.png'
import OSfrog from '../../static/emotes/OSfrog.png'
import PogChamp from '../../static/emotes/PogChamp.png'
import SMOrc from '../../static/emotes/SMOrc.png'
import SwiftRage from '../../static/emotes/SwiftRage.png'
import WutFace from '../../static/emotes/WutFace.png'

import './Chat.css'

const messages = [
  `If you experience any bugs/problems, contact ${config.metadata.email} for help.`,
  `Add ${config.metadata.url} to your name and receive 20% less tax.`,
  'Dont forget to join our discord server for support and giveaways info: ' + config.metadata.discord
]

const emotes = {'4Head': FourHead, 'ANELE': ANELE, 'BabyRage': BabyRage, 'BibleThump': BibleThump, 'BrokeBack': BrokeBack, 'cmonBruh': cmonBruh, 'CoolCat': CoolCat, 'CorgiDerp': CorgiDerp,
                'EleGiggle': EleGiggle, 'FailFish': FailFish, 'FeelsBadMan': FeelsBadMan, 'FeelsGoodMan': FeelsGoodMan, 'Kappa': Kappa, 'Kreygasm': Kreygasm, 'MrDestructoid': MrDestructoid,
                'OSfrog': OSfrog, 'PogChamp': PogChamp, 'SMOrc': SMOrc, 'SwiftRage': SwiftRage, 'WutFace': WutFace}

class Chat extends Component {

  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.submitChat = this.submitChat.bind(this)
    this.clearChat = this.clearChat.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.setupBanCommand = this.setupBanCommand.bind(this)
    this.setupMuteCommand = this.setupMuteCommand.bind(this)

    this.state = {
      open: true
    }
  }

  componentWillMount() {
    this.props.secureSocket.on('RECEIVE_CHAT', (data) => {
      this.props.receiveChat(data)
    })

    this.props.secureSocket.on('DELETE_MESSAGE', (messageId) => {
      this.props.removeChat(messageId)
    })

    this.props.secureSocket.on('MUTE_USER', ({ user, reason, expiration }) => {
      const dateExpired = expiration ? new Date(expiration) : null
      if (dateExpired) {
        this.sendBotMessage(`User '${user}' has been muted for ${reason} for ${moment(dateExpired).fromNow(true)}`)
      } else {
        this.sendBotMessage(`User '${user}' has been permanently muted for ${reason}`)
      }
    })

    this.props.secureSocket.on('BAN_USER', ({ user, reason }) => {
      this.sendBotMessage(`User ${user} has been banned for ${reason}`)
    })

    if (!this.props.chat.loaded) {
      this.props.loadChat()
    }

    this.botMessageIndex = 0

    this.botInterval = setInterval(() => {
      this.sendBotMessage(messages[this.botMessageIndex])
      this.botMessageIndex++
      if (this.botMessageIndex >= messages.length) {
        this.botMessageIndex = 0
      }
    }, 10 * 60 * 1000)
  }

  componentWillUnmount() {
    this.props.secureSocket.off('RECEIVE_CHAT')
    this.props.secureSocket.off('DELETE_MESSAGE')
    this.props.secureSocket.off('BAN_USER')
    this.props.secureSocket.off('MUTE_USER')

    clearInterval(this.botInterval)
  }

  handleClick(e) {
    e.preventDefault()
    this.setState({
      open: !this.state.open
    })
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this.submitChat()
    }
  }

  scrollToBottom() {
    const node = ReactDOM.findDOMNode(this.messagesEnd)
    node.scrollIntoView({behavior: "smooth"})
  }

  componentDidMount() {
    this.scrollToBottom()
  }

  componentDidUpdate() {
    this.scrollToBottom()
  }

  sendBotMessage(message) {
    this.props.receiveChat({
      user: {
        level: 999,
        image: logo,
        name: config.metadata.name + ' Bot'
      },
      message
    })
  }

  setupMuteCommand(userId) {
    this.refs.messageText.value = `/mute id:${userId} r:[reason] d:[duration]`
    this.sendBotMessage('Duration is formatted as follows: 1d,2h,3m for 1 day, 2 hours, and 3 minutes')
  }

  setupBanCommand(userId) {
    this.refs.messageText.value = `/ban id:${userId} r:[reason]`
    this.sendBotMessage('Duration is formatted as follows: 1d,2h,3m for 1 day, 2 hours, and 3 minutes')
  }

  renderMessage() {
    return this.props.chat.messages.slice(0).reverse().map((message, key) => {
      const emoteMessage = this.replaceWithEmotes(this.escapeHTML(message.message))
      return <Message key={key} messageId={message.id} muteUser={this.setupMuteCommand} deleteMessage={this.props.deleteMessage} banUser={this.setupBanCommand} user={message.user} message={emoteMessage} viewer={this.props.user} />
    })
  }

  replaceWithEmotes(text) {
    let newText = text
    for (const emote in emotes) {
      if (newText.indexOf(emote) >= 0) {
        newText = newText.split(emote).join(`<img class="Emote" src="${emotes[emote]}">`)
      }
    }
    return newText
  }

  addEmoteInChat(emote) {
    this.refs.messageText.value = (this.refs.messageText.value + '' + emote)
  }

  escapeHTML(unsafe) {
    return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  getEmotes() {
    return Object.keys(emotes).map((emote, key) => (
      <Popup
        trigger={<img className="EmoteDisplay" onClick={() => this.addEmoteInChat(emote)} src={emotes[emote]} key={key} alt={emote} />}
        content={emote}
        offset={5}
        key={key}
      />
    ))
  }

  submitChat() {
    const message = this.refs.messageText.value
    if (!message || message.length === 0) {
      NotificationManager.error('Enter a message before submitting')
      return;
    }

    if (this.props.chat.sending) {
      return NotificationManager.error('You are already sending a message')
    }

    if (message.indexOf('/ban') === 0) {
      const { reason, userId } = this.getCommandDetails(message)
      if (!userId || !reason) {
        return NotificationManager.error('Invalid ban format')
      }
      this.clearChat()
      return this.props.banUser(userId, reason)
    } else if (message.indexOf('/mute') === 0) {
      const { duration, reason, userId } = this.getCommandDetails(message)
      if (!userId || !reason) {
        return NotificationManager.error('Invalid mute format')
      }
      this.clearChat()
      return this.props.muteUser(userId, reason, duration)
    } else if (message.indexOf('/addbot') === 0) {
      const parts = message.split(" ")
      // /addbot name password shared identity
      if (parts.length !== 5) {
        return this.sendBotMessage("Add bot format: /addbot <username> <password> <shared secret> <identity secret>")
      }
      const [, accountName, password, sharedSecret, identitySecret] = parts
      this.clearChat()
      return this.props.addBot(accountName, password, sharedSecret, identitySecret)
    } else if (message.indexOf('/removebot') === 0) {
      const parts = message.split(" ")
      if (parts.length !== 2) {
        return this.sendBotMessage("Remove bot format: /removebot <username>")
      }
      const [, accountName] = parts
      this.clearChat()
      return this.props.removeBot(accountName)
    }

    this.props.sendChat(message)
    this.clearChat()
  }

  getCommandDetails(message) {
    const commandQuery = message.substring(1)
    const args = commandQuery.split(' ')

    const command = getCommandProperties(args)
    var duration
    if (command.d) {
      duration = futureDateFromText(command.d[0]).getTime()
    }
    return { userId: command.id ? command.id[0] : null, reason: command.r ? command.r.join(' ') : null, duration }
  }

  clearChat() {
    this.refs.messageText.value = ""
  }

  render() {
    const { open } = this.state
    const { user, count } = this.props
    const iconClass = open ? 'compress' : 'expand'
    const chatClass = open ? 'open' : ''

    return (
      <div>
        <div className="Chat__Toggle">
          <FontAwesome name={iconClass} onClick={this.handleClick} />
        </div>
        <div className={`Chat ${chatClass}`}>
          {/* <div className="Chat__Advertisement">
            <LinkContainer activeClassName="" to="/giveaway">
              <img src={giveaway} alt="giveaway" />
            </LinkContainer>
          </div> */}
          <div className="Chat__Header">
            <span className="Chat__Header-Wrapper">
              <FontAwesome name="users" className="Chat__Header-Icon" />
              Online - <span className="Chat__Header-Online">{ count }</span>
            </span>
          </div>
          <div className="Chat__Box">
            { this.renderMessage() }
            <div style={{float:"left", clear: "both"}} ref={(el) => { this.messagesEnd = el; }}></div>
          </div>
          <div className="Chat__Input">
            { user ? (
              <div>
                <textarea onKeyPress={this.handleKeyPress} maxLength="200" placeholder="Send a message..." ref="messageText"></textarea>
                <div className="Chat__Input-Buttons">
                  <Popup trigger={
                    <a><i className="fa fa-smile-o" aria-hidden="true"></i></a>
                  } on="click" hideOnScroll inverted offset={10}>
                    { this.getEmotes() }
                  </Popup>
                  <button type="submit" onClick={this.submitChat}>SEND</button>
                </div>
              </div>
            ) : (
              <div className="Chat__Input-Anon">
                <a href={`${api.url}api/auth/steam`}>Login to Chat</a>
              </div>
            ) }
          </div>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    user: state.auth.user,
    count: state.users.count,
    chat: state.chat
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    sendChat,
    receiveChat,
    loadChat,
    removeChat,
    deleteMessage,
    banUser,
    muteUser,
    addBot,
    removeBot
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat)
