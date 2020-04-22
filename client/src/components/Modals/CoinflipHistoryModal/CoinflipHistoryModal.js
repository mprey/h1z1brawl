import React, { Component } from 'react'
import Modal from 'react-modal'
import { Row, Col } from 'react-bootstrap'
import { getUserTotal, getCoinflipTotal, didCreatorWin } from '../../../util/coinflip'
import black from '../../../static/coin-heads.png'
import red from '../../../static/coin-tails.png'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

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

export default class CoinflipHistoryModal extends Component {

  renderGame() {
    const { game } = this.props
    return (
      <Row>
        <Col xs={6}>
          { this.renderUser(game.creator, game.startingSide === 'black' ? black : red, this.getCreatorPercent(game), '') }
        </Col>
        <Col xs={6}>
          { this.renderUser(game.joiner, game.startingSide === 'black' ? red : black, this.getJoinerPercent(game), '') }
        </Col>
        <div className="Status">
          { this.getStatus() }
        </div>
      </Row>
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
    return this.displayWinner(didCreatorWin(game) ? game.startingSide : (game.startingSide === 'black' ? 'red' : 'black'), game)
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
          <h1>History</h1>
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
