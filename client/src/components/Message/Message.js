import React, { Component } from 'react'
import { Popup, Divider, Button } from 'semantic-ui-react'
import { ranks } from '../../constants'

import './Message.css'

class Message extends Component {

  getUserLevel() {
    const { user } = this.props
    if (user.rank > 1) {
      return (<i className="fa fa-star" aria-hidden="true"></i>)
    } else {
      return (user.level)
    }
  }

  getHeaderClass() {
    const { rank } = this.props.user
    if (rank > 0) {
      return ranks[rank]
    }
    return ''
  }

  render() {
    const { user, message, viewer, messageId } = this.props

    const messageObject = (
      <div className="Message">
        <div className={`Message__Header ${this.getHeaderClass()}`}>
          <span className="Message__Header--Level">{ this.getUserLevel() }</span>
          <a target="_blank" href={`https://steamcommunity.com/profiles/${user._id}`}>
            <img src={user.image} alt="user" />
            <span>{user.name}</span>
          </a>
        </div>
        <div className="Message__Content" dangerouslySetInnerHTML={{__html: message}} />
      </div>
    )

    if (viewer && viewer.rank >= 2) {
      return (
          <Popup trigger={messageObject} inverted on='click'>
            <Popup.Header>User Actions</Popup.Header>
            <Divider />
            <Popup.Content>
              <Button.Group vertical>
                <Button onClick={() => this.props.deleteMessage(messageId)}>Delete Message</Button>
                <Button onClick={() => this.props.muteUser(user._id)}>Mute User</Button>
                <Button onClick={() => this.props.banUser(user._id)}>Ban User</Button>
              </Button.Group>
            </Popup.Content>
          </Popup>
      )
    }
    return messageObject
  }

}

export default Message
