import React, { Component } from 'react'
import Modal from 'react-modal'
import { CoinflipInventoryItem } from '../../../containers'
import { NotificationManager } from 'react-notifications'
import config from '../../../../../config'

import './JackpotDepositModal.css'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'
const { minItems, maxItems, minAmount, itemThreshold } = config.jackpot

export default class JackpotDepositModal extends Component {

  constructor(props) {
    super(props)

    this.onClose = this.onClose.bind(this)
    this.afterOpen = this.afterOpen.bind(this)
    this.forceRefresh = this.forceRefresh.bind(this)
    this.depositItems = this.depositItems.bind(this)

    this.state = {
      selectedItems: []
    }
  }

  depositItems() {
    const betValue = this.getTotalSelectedPrice(), itemsSelected = this.getSelectedCount()
    if (betValue < minAmount) {
      return NotificationManager.error(`Bet must be at least $${minAmount}`)
    } else if (itemsSelected < minItems || itemsSelected > maxItems) {
      return NotificationManager.error(`You must select between ${minItems} and ${maxItems} items`)
    }
    this.onClose()
    this.props.depositItems(this.getSelectedItems())
  }

  afterOpen() {
    this.props.loadInventory()
  }

  onClose() {
    this.setState({ selectedItems: [] })
    this.props.onClose()
  }

  renderItems() {
    const { items, error, loading } = this.props.inventory
    if (loading) {
       return (
         <i className="fa fa-spinner fa-pulse fa-3x fa-fw ItemLoading"></i>
       )
    } else if (error && items.length === 0) {
      return (
        <div className="Modal__CreateCoinflip-Error">
          <span>An error ocurred loading your inventory. You may not have any tradeable { config.metadata.gameName } items or Steam is offline.</span>
        </div>
      )
    }
    const sorted = this.sortItems(items)
    return sorted.map((item, key) => (
      <CoinflipInventoryItem
        name={item.name}
        image={`${IMAGE_URL}${item.icon_url}`}
        selected={this.isSelected(key)}
        price={item.price} key={key}
        disabled={(item.price < itemThreshold) || (!config.jackpot.allowedItems.includes("*") && !config.jackpot.allowedItems.includes(item.name))}
        unselect={() => this.unselectItem(key)}
        select={() => this.selectItem(key)}
      />
    ))
  }

  forceRefresh() {
    this.setState({ selectedItems: [] })
    this.props.forceRefreshInventory()
  }

  render() {
    const betValue = this.getTotalSelectedPrice(), itemsSelected = this.getSelectedCount()
    const betClass = (betValue >= minAmount) ? 'good' : 'bad'
    const itemClass = (itemsSelected >= minItems && itemsSelected <= maxItems) ? 'good' : 'bad'

    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.onClose}
        closeTimeoutMS={200}
        onAfterOpen={this.afterOpen}
        contentLabel="Modal"
        className="Modal Modal__CreateCoinflip-Created"
        overlayClassName="Modal__Overlay"
      >
        <div className="Modal__Header">
          <h1>Jackpot Deposit</h1>
          <a onClick={this.onClose}><i className="fa fa-times" /></a>
        </div>
        <div className={'Modal__Content Modal__CreateCoinflip-Content'}>
          <h4>Deposit your items to jackpot</h4>
          <p>Min bet ${minAmount} - Max items {maxItems}</p>
          <a className="noselect" onClick={this.forceRefresh}>
            <span>Force Refresh</span>
            <div>
              <i className="fa fa-refresh" />
            </div>
          </a>
          <div className="Modal__CreateCoinflip-Items">
            { this.renderItems() }
          </div>
          <div className="Modal__CreateCoinflip-Input">
            <p className="InputHeader"><span>Values</span></p>
            <div className="Modal__CreateCoinflip-Values Modal__JoinCoinflip--Values">
              <p className="BetValue">Bet Value <span className={betClass}>{`$${Number(betValue).toFixed(2)}`}</span></p>
              <p className="ItemsSelected">Items Selected <span className={itemClass}>{`${itemsSelected}/${maxItems}`}</span></p>
              <p className="InventoryValue">Inventory Value <span>{`$${this.getTotalInventoryPrice()}`}</span></p>
            </div>
            <p className="InputHeader"><span>Options</span></p>
            <div className="Modal__CreateCoinflip-Options">
              <div>
                <a className="ClearItems" onClick={this.clearItems}>Clear</a>
                <a onClick={this.onClose}>Cancel</a>
              </div>
            </div>
            <a onClick={this.depositItems} className="CreateGame">Deposit</a>
          </div>
        </div>
      </Modal>
    )
  }

  /* HELPER METHODS */

  getSelectedCount() {
    return this.state.selectedItems.length
  }

  getSelectedItems() {
    const array = []
    for (var index in this.state.selectedItems) {
      array.push(this.props.inventory.items[this.state.selectedItems[index]])
    }
    return array
  }

  getTotalSelectedPrice() {
    let total = 0.00
    for (var index in this.state.selectedItems) {
      total += parseFloat(this.props.inventory.items[this.state.selectedItems[index]].price)
    }
    return parseFloat(total)
  }

  getTotalInventoryPrice() {
    let total = 0.00
    for (var index in this.props.inventory.items) {
      total += parseFloat(this.props.inventory.items[index].price)
    }
    return Number(total).toFixed(2)
  }

  isSelected(key) {
    for (var index in this.state.selectedItems) {
      if (this.state.selectedItems[index] === key) {
        return true
      }
    }
    return false
  }

  selectItem(index) {
    this.setState({
      selectedItems: this.state.selectedItems.concat([index])
    })
  }

  unselectItem(index) {
    this.setState({
      selectedItems: this.state.selectedItems.filter((el) => el !== index)
    })
  }

  clearItems() {
    this.setState({
      selectedItems: []
    })
  }

  sortItems(items) {
    items.forEach(function(item, index) {
      item.origOrder = index;
    })
    return items.sort((a, b) => {
      const diff = parseFloat(b.price) - parseFloat(a.price)
      if (diff === 0) {
        return a.origOrder - b.origOrder
      }
      return diff
    })
  }
}
