import React, { Component } from 'react'
import Modal from 'react-modal'

import './TradeOfferModal.css'

export default class TradeOfferModal extends Component {

  constructor(props) {
    super(props)

    this.requestClose = this.requestClose.bind(this)
  }

  /*  PROPS
   *
   *  tradeOffer - object of the trade offer
   *
   */

  requestClose() {
    setTimeout(this.props.onClose, 1000) /* wait 1 second before closing to allow href */
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onClose}
        closeTimeoutMS={200}
        contentLabel="Modal"
        className={'Modal Modal__TradeOffer'}
        overlayClassName={'Modal__Overlay'}
      >
        <div className="Modal__Header">
          <h1>Accept your trade offer...</h1>
          <a onClick={this.props.onClose}><i className="fa fa-times" /></a>
        </div>
        <div className="Modal__Content Modal__TradeOffer-Content">
          <p>You have two minutes to accept the trade offer before it is canceled.</p>
          <p>Security Code: <span>{this.props.tradeOffer ? this.props.tradeOffer.offerId : null}</span></p>
          <hr />
          <a onClick={this.requestClose} href={`https://steamcommunity.com/tradeoffer/${this.props.tradeOffer ? this.props.tradeOffer.id : null}`} target="_blank">Accept Trade</a>
        </div>
      </Modal>
    )
  }

}
