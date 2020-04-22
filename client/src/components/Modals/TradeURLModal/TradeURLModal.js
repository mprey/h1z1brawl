import React, { Component } from 'react'
import Modal from 'react-modal'
import { Input } from 'semantic-ui-react'

import './TradeURLModal.css'

export default class TradeURLModal extends Component {

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.close}
        closeTimeoutMS={200}
        contentLabel="Modal"
        className={'Modal Modal__TradeURL'}
        overlayClassName={'Modal__Overlay'}
      >
        <div className="Modal__Header">
          <h1>Set your trade URL...</h1>
          <a onClick={this.props.close}><i className="fa fa-times" /></a>
        </div>
        <div className="Modal__Content Modal__TradeURL-Content">
          <p>
              In order to receive your winnings from our games, you need
              to set your trading URL before your play. First, make sure your
              inventory is set to public, then click the button below to find
              your trade URL.
          </p>
          <a href="https://steamcommunity.com/id/me/tradeoffers/privacy#trade_offer_access_url" target="_blank">Find your trade URL</a>
          <hr />
          <Input
            placeholder={'https://steamcommunity.com/...'}
            className="Modal__TradeURL-Input"
            ref="input" />
          <div className="Modal__TradeURL-Save" onClick={() => this.props.onClick(this.refs.input)}>
            <span>Save</span>
          </div>
        </div>
      </Modal>
    )
  }

}
