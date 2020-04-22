import React, { Component } from 'react'
import CoinflipGameItem from './CoinflipGameItem'
import { Popup } from 'semantic-ui-react'
import { CountDownTimer } from '../../components'
import { didCreatorWin } from '../../util/coinflip'
import black from '../../static/coin-heads.png'
import red from '../../static/coin-tails.png'
import noUser from '../../static/no-user.jpg'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

export default class CoinflipGame extends Component {

  renderItems() {
    const sorted = this.sortedItems()
    if (sorted.length > 7) {
      const items = sorted.slice(0, 6).map((item, key) => (
        <CoinflipGameItem key={key} name={item.name} image={`${IMAGE_URL}${item.icon_url}`} price={item.price} />
      ))
      return (
        <div className="Ignore">
          {items}
          <span>+{sorted.length - 6} more items...</span>
        </div>
      )
    }
    return sorted.map((item, key) => (
      <CoinflipGameItem key={key} name={item.name} image={`${IMAGE_URL}${item.icon_url}`} price={item.price} />
    ))
  }

  sortedItems() {
    return this.props.game.creator.items.sort((a, b) => {
      return b.price - a.price
    })
  }

  getTotalValue() {
    let total = 0.00
    for (const index in this.props.game.creator.items) {
      const item = this.props.game.creator.items[index]
      if (item && item.price) {
        total += parseFloat(item.price)
      }
    }
    if (this.props.game.joiner && this.props.game.joiner.items) {
      for (const index in this.props.game.joiner.items) {
        const item = this.props.game.joiner.items[index]
        if (item && item.price) {
          total += parseFloat(item.price)
        }
      }
    }
    return Number(total).toFixed(2)
  }

  getStartingSide() {
    if (this.props.game.startingSide === 'red') {
      return red
    }
    return black
  }

  getImages() {
    const { game } = this.props
    if (didCreatorWin(game)) {
      return [game.creator.image, game.joiner.image, (game.startingSide === 'black' ? black : red)]
    } else {
      return [game.joiner.image, game.creator.image, (game.startingSide === 'black' ? red : black)]
    }
  }

  getStatus() {
    const [winner, loser, side] = this.getImages()
    return (<div>
              <img src={winner} className="Winner" alt="winner" />
              <img src={side} className="Side" alt="side" />
            </div>)
  }

  getPlayers() {
    const { creator, joiner } = this.props.game

    return (
      <div>
        <Popup
          inverted
          content={creator.name}
          trigger={
            <a href={`https://steamcommunity.com/profiles/${creator.id}`} target="_blank"><img src={creator.image} alt="user1" /></a>
          }
        />
        <span>vs.</span>
        <Popup
          inverted
          content={joiner.name ? joiner.name : ''}
          trigger={joiner.image ? (
            <a href={`https://steamcommunity.com/profiles/${joiner.id}`} target="_blank"><img src={joiner.image} alt="user2" /></a>
          ) : (
            <div className="None"></div>
          )} />
      </div>
    )
  }

  render() {
    const totalValue = this.getTotalValue()
    return (
      <tr className="Coinflip__Game">
        <td className="Coinflip__Side">
          <img src={this.getStartingSide()} alt="side" />
        </td>
        <td className="Coinflip__Players">
          { this.getPlayers() }
        </td>
        <td className="Coinflip__Items">
          { this.renderItems() }
        </td>
        <td className="Coinflip__Value">
          <span>{`$${totalValue}`}</span>
        </td>
        <td className="Coinflip__Status">
          { this.getStatus() }
        </td>
        <td className="Coinflip__Actions">
          <a className="noselect create" onClick={this.props.onVerify}>
            <span>Verify</span>
            <div>
              <i className="fa fa-check-square-o"></i>
            </div>
          </a>
          <a className="noselect watch" onClick={this.props.onView}>
            <span>View</span>
            <div>
              <i className="fa fa-eye"></i>
            </div>
          </a>
        </td>
      </tr>
    )
  }

}
