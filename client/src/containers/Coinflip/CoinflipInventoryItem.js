import React, { Component } from 'react'
import { Popup } from 'semantic-ui-react'

export default class CoinflipInventoryItem extends Component {

  constructor(props) {
    super(props)

    this.onItemClick = this.onItemClick.bind(this)
  }

  /*
   *  image: image of the item
   *  price: price of the item
   *  name: name of the item
   *  tier(?): tier for class highlighting
   */

  onItemClick() {
    if (!this.props.disabled && !this.props.selected) {
      this.props.select()
    } else if (!this.props.disabled && this.props.selected) {
      this.props.unselect()
    }
  }

  getComponent() {
    return (
      <div className={'Coinflip__InventoryItem ' + (this.props.disabled ? 'disabled' : '') + (this.props.selected ? 'selected' : '')} onClick={this.onItemClick}>
        <img src={this.props.image} alt="item" />
        <p>{this.props.price}</p>
        {this.props.selected &&
          <i className="fa fa-check" />
        }
      </div>
    )
  }

  render() {
    return (
      <Popup
        trigger={this.getComponent()}
        content={this.props.name}
        inverted
      />
    )
  }

}
