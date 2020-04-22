import React, { Component } from 'react'
import JackpotDeposit from './JackpotDeposit'
import { getTotalJackpotItems, getJackpotTotal } from '../../util/jackpot'

export default class JackpotRound extends Component {

  constructor(props) {
    super(props)

    this.state = {
      titeExpanded: false,
      winnerExpanded: false
    }
  }

  renderGameTitle() {
    const { round } = this.props
    return (
      <li className={`${this.state.titleExpanded ? 'active' : ''}`}>
        <div className="Round__Header Title" onClick={() => this.setState({ titleExpanded: !this.state.titleExpanded })}>
          <i className="fa fa-info-circle" />
          <p>Round Hash: <span className="highlight">{round.hash}</span></p>
        </div>
        <div className="Round__Body">
          <p>Round <span className="highlight">#{round._id}</span></p>
          <p>Hash <span className="highlight">{round.hash}</span></p>
          <p>Date <span className="highlight">{new Date(round.dateCreated).toLocaleTimeString()}</span></p>
        </div>
      </li>
    )
  }

  renderDeposits() {
    const { deposits } = this.props.round
    const reversed = deposits.slice(0).reverse()
    return reversed.map((deposit, key) => (
      <JackpotDeposit key={key} deposit={deposit} />
    ))
  }

  renderWinner() {
    const { round } = this.props
    if (round.completed) {
      const { winner } = round
      const items = getTotalJackpotItems(round), total = getJackpotTotal(round)
      const canShowWinner = !this.props.isRoundRolling(round._id)
      return (
        <li className={`Round__Deposit Round__Winner ${this.state.winnerExpanded ? 'active' : ''}`}>
          <div className="Round__Header" onClick={() => this.setState({ winnerExpanded: !this.state.winnerExpanded })}>
            {canShowWinner &&
              <a target="_blank" href={`https://steamcommunity.com/profiles/${winner.id}`}>
                <img src={winner.image} alt="user" />
                <span className="Deposit__Name">{winner.name}</span>
              </a>
            }
            <div className="Deposit__Right">
              <span>{items} items</span>
              <span>${Number(total).toFixed(2)}</span>
            </div>
          </div>
          <div className="Round__Body">
            <p>Round <span className="highlight">#{round._id}</span></p>
            <p>Percent <span className="highlight">{round.winningPercentage}</span></p>
            <p>Salt <span className="highlight">{round.secret}</span></p>
          </div>
        </li>
      )
    }
    return null
  }

  render() {
    return (
      <ul className="JackpotRound">
        { this.renderWinner() }
        { this.renderDeposits() }
        { this.renderGameTitle() }
      </ul>
    )
  }

}
