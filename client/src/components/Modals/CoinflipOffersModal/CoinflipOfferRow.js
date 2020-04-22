import React, { Component } from 'react'
import { Popup } from 'semantic-ui-react'

const failureReasons = {
  "1": "Invalid",
	"2": "Active",
	"3": "Accepted",
	"4": "Countered",
	"5": "Expired",
	"6": "Canceled",
	"7": "Declined",
	"8": "InvalidItems",
	"9": "CreatedNeedsConfirmation",
	"10": "CanceledBySecondFactor",
	"11": "InEscrow"
}

export default class CoinflipOfferRow extends Component {

  getStatus() {
    const { offer } = this.props
    if (offer.completed == true) {
      return (
        <p className="Completed"><span>Completed</span></p>
      )
    } else if (offer.failed == true) {
      return (
        <Popup
          trigger={<p className="Failed"><span>Failed</span></p>}
          content={failureReasons[offer.failureReason]}
          offset={-4}
          inverted
        />
      )
    } else {
      return (
        <p className="Open"><span>Waiting</span></p>
      )
    }
  }

  getItemContent(items) {
    return items.map((item, index) => (
      <p key={index}>{item.name}</p>
    ))
  }

  getBotItems() {
    const { botItems } = this.props.offer
    return (
      <Popup
        trigger={<p>{`${botItems.length} item${botItems.length == 1 ? '' : 's'}`}</p>}
        content={this.getItemContent(botItems)}
        offset={-15}
        inverted
      />
    )
  }

  canCancelOffer() {
    return this.props.offer.completed != true && this.props.offer.failed != true
  }

  getLinkButton() {
    return (
      <a href={`https://steamcommunity.com/tradeoffer/${this.props.offer.tradeId}`} target="_blank">
        <i className="fa fa-external-link" />
      </a>
    )
  }

  getCancelButton() {
    return (
      <i
        className={`fa fa-ban ${this.canCancelOffer() ? '' : 'disabled'}`}
        onClick={() => {
          if (this.canCancelOffer()) {
            this.props.cancelOffer(this.props.offer)
          }
        }}
      />
    )
  }

  getUserItems() {
    const { userItems } = this.props.offer
    return (
      <Popup
        trigger={<p>{`${userItems.length} item${userItems.length == 1 ? '' : 's'}`}</p>}
        content={this.getItemContent(userItems)}
        offset={-15}
        inverted
      />
    )
  }

  render() {
    const { _id, gameId, botId } = this.props.offer
    return (
      <tr className="OfferRow">
        <td className="OfferId">{_id}</td>
        <td className="GameId">{gameId}</td>
        <td className="BotId">{botId}</td>
        <td className="Items">{this.getUserItems()}</td>
        <td className="Items">{this.getBotItems()}</td>
        <td className="Status">{this.getStatus()}</td>
        <td className="Link">{this.getLinkButton()}</td>
        <td className="Cancel">{this.getCancelButton()}</td>
      </tr>
    )
  }

}
