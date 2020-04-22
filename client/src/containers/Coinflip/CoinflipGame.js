import React, { Component } from 'react'
import CoinflipGameItem from './CoinflipGameItem'
import { Popup } from 'semantic-ui-react'
import { CountDownTimer } from '../../components'
import { didCreatorWin } from '../../util/coinflip'
import black from '../../static/coin-heads.png'
import red from '../../static/coin-tails.png'
import noUser from '../../static/no-user.jpg'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

const WAITING_COUNTDOWN = 120
const COMPLETION_COUNTDOWN = 10

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
        total += Number(item.price)
      }
    }
    if (this.props.game.joiner && this.props.game.joiner.items) {
      for (const index in this.props.game.joiner.items) {
        const item = this.props.game.joiner.items[index]
        if (item && item.price) {
          total += Number(item.price)
        }
      }
    }
    return parseFloat(Number(total).toFixed(2))
  }

  getRange(totalValue) {
    const range = (totalValue * 0.05)
    return [Number(totalValue - range).toFixed(2), Number(totalValue + range).toFixed(2)]
  }

  getNumberData() {
    const totalValue = this.getTotalValue()
    const [low, high] = this.getRange(totalValue)
    return [Number(totalValue).toFixed(2), low, high]
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

  getStatus() { //game.dateCompleted, game.dateJoined
    const { game } = this.props
    if (game.completed) {
      const { dateCompleted } = game
      const secondsSinceCompleted = parseInt((new Date().getTime() - new Date(dateCompleted).getTime()) / 1000)

      if (secondsSinceCompleted > COMPLETION_COUNTDOWN) {
        const [winner, loser, side] = this.getImages()
        return (<div>
                  <img src={winner} className="Winner" alt="winner" />
                  <img src={side} className="Side" alt="side" />
                </div>)
      }

      return <CountDownTimer
                 secondsRemaining={COMPLETION_COUNTDOWN - secondsSinceCompleted}
                 totalSeconds={COMPLETION_COUNTDOWN}
                 color="rgb(95, 144, 112)"
                 onComplete={() => {
                   this.forceUpdate()
                 }}
               />
    } else if (game.joiner.id) {
      const { dateJoined } = game
      let secondsSinceJoined = parseInt((new Date().getTime() - new Date(dateJoined).getTime()) / 1000)

      if (secondsSinceJoined > WAITING_COUNTDOWN) {
        secondsSinceJoined = WAITING_COUNTDOWN //hopefully this never happens ;)
      }

      return <CountDownTimer
                secondsRemaining={WAITING_COUNTDOWN - secondsSinceJoined}
                totalSeconds={WAITING_COUNTDOWN}
                color="rgba(154, 51, 51, 0.86)"
              />
    } else {
      return (<span>Open</span>)
    }
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
    const [totalValue, lowMargin, highMargin] = this.getNumberData()
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
          <p><span>{`${lowMargin} - ${highMargin}`}</span></p>
        </td>
        <td className="Coinflip__Status">
          { this.getStatus() }
        </td>
        <td className="Coinflip__Actions">
          {!this.props.game.joiner.id &&
            <a className="noselect create" onClick={this.props.onJoin}>
              <span>Join</span>
              <div>
                <i className="fa fa-sign-in"></i>
              </div>
            </a>
          }
          <a className="noselect watch" onClick={this.props.onWatch}>
            <span>Watch</span>
            <div>
              <i className="fa fa-eye"></i>
            </div>
          </a>
        </td>
      </tr>
    )
  }

}
