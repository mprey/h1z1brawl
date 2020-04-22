import React, { Component } from 'react'
import Modal from 'react-modal'
import { Row, Col } from 'react-bootstrap'
import { getUserTotal, getCoinflipTotal, didCreatorWin } from '../../../util/coinflip'
import { CountDownTimer } from '../../'
import black from '../../../static/coin-heads.png'
import red from '../../../static/coin-tails.png'

import './CoinflipWatchModal.css'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'
const WAITING_COUNTDOWN = 120
const COMPLETION_COUNTDOWN = 10

class CoinflipWatchItem extends Component {
  render() {
    return (
      <div className="Item">
        <img src={`${IMAGE_URL}${this.props.item.icon_url}`} alt="item" />
        <div>
          <p>{this.props.item.name}</p>
          <span>{Number(this.props.item.price).toFixed(2)}</span>
        </div>
      </div>
    )
  }
}

export default class CoinflipWatchModal extends Component {

  renderGame() {
    const { game } = this.props
    return (
      <Row>
        <Col xs={6}>
          { this.renderUser(game.creator, game.startingSide === 'black' ? black : red, this.getCreatorPercent(game), this.props.hasGameFlipped(game) ? (didCreatorWin(game) ? 'winner' : 'loser') : '') }
        </Col>
        <Col xs={6}>
          { this.renderUser(game.joiner, game.startingSide === 'black' ? red : black, this.getJoinerPercent(game), this.props.hasGameFlipped(game) ? (didCreatorWin(game) ? 'loser' : 'winner') : '') }
        </Col>
        <div className="Status">
          { this.getStatus() }
        </div>
      </Row>
    )
  }

  flipCoin(game, winningSide) {
    const id = (' ' + game._id).slice(1)
    setTimeout(() => {
      this.props.setCoinFlipped(id)
      this.forceUpdate()
    }, 6000)
    return (
      <div className="FlipContainer"><div className={`Flip ${winningSide}`}></div></div>
    )
  }

  displayWinner(winningSide, { winningPercentage, secret }) {
    return (
      <div className="Winner">
        <img src={winningSide === 'black' ? black : red} />
        <p>Roll: <span>{winningPercentage}</span></p>
        <p className="Secret">Secret: <span>{secret}</span></p>
      </div>
    )
  }

  getStatus() {
    const { game } = this.props
    if (game.joiner.id && !game.completed) { /* waiting for the joiner to accept trade (120 second cooldown) */
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
    } else if (game.completed) { /* game has completed, countdown the timer then flip or just render the winner */
      const { dateCompleted } = game
      const secondsSinceCompleted = parseInt((new Date().getTime() - new Date(dateCompleted).getTime()) / 1000)

      if (secondsSinceCompleted >= COMPLETION_COUNTDOWN) {
        if (this.props.hasGameFlipped(game)) {
          return this.displayWinner(didCreatorWin(game) ? game.startingSide : (game.startingSide === 'black' ? 'red' : 'black'), game)
        }
        return this.flipCoin(game, didCreatorWin(game) ? game.startingSide : (game.startingSide === 'black' ? 'red' : 'black'))
      }

      return <CountDownTimer
                 secondsRemaining={COMPLETION_COUNTDOWN - secondsSinceCompleted}
                 totalSeconds={COMPLETION_COUNTDOWN}
                 color="rgb(95, 144, 112)"
                 onComplete={() => {
                   this.forceUpdate()
                 }}
               />
    } else {
      return (<p>Waiting...</p>)
    }
  }

  getSecondsElapsed(time) {
    if (!time) {
      return 0
    }
    return parseInt((new Date().getTime() - time) / 1000)
  }

  getCreatorPercent(game) {
    if (game.joiner.items.length == 0) {
      return '--'
    }
    const total = getCoinflipTotal(game)
    const creatorTotal = getUserTotal(game.creator)
    return Number((creatorTotal / total) * 100).toFixed(3)
  }

  getJoinerPercent(game) {
    if (game.joiner.items.length == 0) {
      return '--'
    }
    const total = getCoinflipTotal(game)
    const joinerTotal = getUserTotal(game.joiner)
    return Number((joinerTotal / total) * 100).toFixed(3)
  }

  renderUser(user, side, percent, resultClass) {
    if (!user.image) {
      return null
    }
    return (
      <div className={`UserDisplay ${resultClass}`}>
        <img className="User" src={user.image} alt="user" />
        <img className="Side" src={side} alt="side" />
        <p>{user.name}</p>
        <span>${Number(getUserTotal(user)).toFixed(2)}</span>
        { this.renderItems(user, percent) }
      </div>
    )
  }

  renderItems(user, percent) {
    if (user.items.length === 0) {
      return (<div className="Waiting">Waiting...</div>)
    }
    const items = this.sortItems(user.items).map((item, key) => (
      <CoinflipWatchItem item={item} key={key} />
    ))
    return (
      <div className="Items">
        <div className="Item Center">{`${percent}%`}</div>
        {items}
      </div>
    )
  }

  sortItems(items) {
    return items.sort((a, b) => b.price - a.price)
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.props.onClose}
        closeTimeoutMS={200}
        onAfterOpen={this.afterOpen}
        contentLabel="Modal"
        className="Modal Modal__WatchCoinflip"
        overlayClassName="Modal__Overlay"
      >
        <div className="Modal__Header">
          <h1>Watching</h1>
          <a onClick={this.props.onClose}><i className="fa fa-times" /></a>
        </div>
        <div className="Modal__Content">
          {this.props.game &&
            this.renderGame()
          }
        </div>
        <div className="Modal__Footer">
          <p>Hash: <span>{this.props.game ? this.props.game.hash : ''}</span></p>
        </div>
      </Modal>
    )
  }

}
