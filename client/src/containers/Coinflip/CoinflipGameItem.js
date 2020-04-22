import React, { Component } from 'react'
import { Popup } from 'semantic-ui-react'

export default class CoinflipItem extends Component {

  getComponent() {
    return (
      <div>
        <img src={this.props.image} alt="item" />
        <p>{Number(this.props.price).toFixed(2)}</p>
      </div>
    )
  }

  render() {
    return (
      <Popup
        inverted
        trigger={this.getComponent()}
        content={this.props.name} />
    )
  }

}
