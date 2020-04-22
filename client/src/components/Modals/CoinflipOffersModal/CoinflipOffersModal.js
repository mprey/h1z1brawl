import React, { Component } from 'react'
import Modal from 'react-modal'
import CoinflipOfferRow from './CoinflipOfferRow'

import './CoinflipOffersModal.css'

export default class CoinflipOffersModal extends Component {

  constructor(props) {
    super(props)

    this.renderOfferTable = this.renderOfferTable.bind(this)
    this.renderOffers = this.renderOffers.bind(this)
  }

  componentWillMount() {
    this.props.requestOffers()
  }

  renderOfferTable() {
    if (this.props.offers.loading) {
      return (
        <i className="fa fa-spinner fa-pulse fa-3x fa-fw OffersLoading"></i>
      )
    } else {
      return (
        <table>
          <thead>
            <tr>
              <th><span>ID</span></th>
              <th><span>Game ID</span></th>
              <th><span>Bot ID</span></th>
              <th><span>Your Items</span></th>
              <th><span>Bot Items</span></th>
              <th><span>Status</span></th>
              <th><span>Link</span></th>
              <th><span>Cancel</span></th>
            </tr>
          </thead>
          <tbody>
            { this.renderOffers() }
          </tbody>
        </table>
      )
    }
  }

  renderOffers() {
    return this.props.offers.offers.map((offer, index) => (
      <CoinflipOfferRow isResending={this.props.isResending} offer={offer} key={index} cancelOffer={this.props.cancelOffer} resendOffer={this.props.resendOffer} />
    ))
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onClose}
        closeTimeoutMS={200}
        contentLabel="Modal"
        className={'Modal Modal__CoinflipOffers'}
        overlayClassName={'Modal__Overlay'}
      >
        <div className="Modal__Header">
          <h1>Coinflip Offers</h1>
          <a onClick={this.props.onClose}><i className="fa fa-times" /></a>
        </div>
        <div className="Modal__CoinflipOffers-Content Modal__Content">
          <div className="Note">
            <p>Users has 48 hours to accept any winnings sent to them</p>
            <p>Each trade offer will last for 2 minutes but can be resent using support</p>
            <a className="RequestOffers" onClick={this.props.requestOffers}>
              <span>Refresh</span>
              <div>
                <i className="fa fa-refresh" />
              </div>
            </a>
          </div>
          <div className="OffersTable">
            { this.renderOfferTable() }
          </div>
        </div>
      </Modal>
    )
  }

}
