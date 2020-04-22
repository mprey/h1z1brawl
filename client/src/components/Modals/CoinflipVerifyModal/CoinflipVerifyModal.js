import React, { Component } from 'react'
import Modal from 'react-modal'
import { Input } from 'semantic-ui-react'
import { NotificationManager } from 'react-notifications'
import md5 from 'md5'

import './CoinflipVerifyModal.css'

export default class CoinflipVerifyModal extends Component {

  constructor(props) {
    super(props)

    this.verify = this.verify.bind(this)
  }

  verify() {
    const hash = this.refs.hash.inputRef.value
    const salt = this.refs.salt.inputRef.value
    const percent = this.refs.percent.inputRef.value

    function isFloat(n){
      return n != "" && !isNaN(n) && Math.round(n) != n;
    }

    if (!hash || !salt || !percent) {
      return NotificationManager.error('Not Verified')
    }

    const testHash = md5(`${salt}-${percent}`)

    if (testHash === hash) {
      return NotificationManager.success('Verified')
    }
    NotificationManager.error('Not Verified')
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onClose}
        closeTimeoutMS={200}
        contentLabel="Modal"
        className={'Modal Modal__VerifyCoinflip'}
        overlayClassName={'Modal__Overlay'}
      >
        <div className="Modal__Header">
          <h1>Verify a Coin Flip</h1>
          <a onClick={this.props.onClose}><i className="fa fa-times" /></a>
        </div>
        <div className="Modal__Content Modal__VerifyCoinflip-Content">
          <p>
              The Provably Fair system uses an md5 encryption of the winning percentage
              and a randomly generated salt to provide the user with a hash before the
              game has completed in order to reinforce the randonmess to every coin flip.
          </p>
          <hr />
          <div className="InputWrapper">
            <p><span>Hash:</span></p>
            <Input
              placeholder={'Md5 encrypted hash'}
              defaultValue={this.props.game ? this.props.game.hash : null}
              ref="hash"
            />
          </div>
          <div className="InputWrapper">
            <p><span>Salt:</span></p>
            <Input
              placeholder={'Salt'}
              defaultValue={this.props.game ? this.props.game.secret : null}
              ref="salt"
            />
          </div>
          <div className="InputWrapper">
            <p><span>Percent:</span></p>
            <Input
              placeholder={'Winning percent'}
              defaultValue={this.props.game ? this.props.game.winningPercentage : null}
              ref="percent"
            />
          </div>
          <a onClick={this.verify}>Verify</a>
        </div>
      </Modal>
    )
  }

}
