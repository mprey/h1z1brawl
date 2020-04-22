import React, { Component } from 'react'
import { Popup } from 'semantic-ui-react'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

export default class JackpotDeposit extends Component {

  constructor(props) {
    super(props)

    this.state = {
      expanded: false
    }
  }

  getTotal(deposit) {
    let total = 0.00
    for (const index in deposit.items) {
      total += parseFloat(deposit.items[index].price)
    }
    return total
  }

  renderItems() {
    return this.props.deposit.items.map((item, key) => (
      <Popup
        content={item.name}
        trigger={
          <div className="Round__Item">
            <img src={`${IMAGE_URL}${item.icon_url}`} alt="item" />
            <p>${Number(item.price).toFixed(2)}</p>
          </div>
        }
        inverted
        key={key}
      />
    ))
  }

  render() {
    const { deposit } = this.props
    return (
      <li className={`Round__Deposit ${this.state.expanded ? 'active' : ''}`}>
        <div className="Round__Header" onClick={() => this.setState({ expanded: !this.state.expanded })}>
          <a target="_blank" href={`https://steamcommunity.com/profiles/${deposit.id}`}>
            <img src={deposit.image} alt="user" />
          </a>
          <span className="Deposit__Name">{deposit.name}</span>
          <div className="Deposit__Right">
            <span>{deposit.items.length} items</span>
            <span>${Number(this.getTotal(deposit)).toFixed(2)}</span>
          </div>
        </div>
        <div className="Round__Body">
          { this.renderItems() }
        </div>
      </li>
    )
  }

}
