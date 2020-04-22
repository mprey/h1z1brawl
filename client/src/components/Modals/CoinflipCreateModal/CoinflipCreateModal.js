import React, { Component } from 'react'
import Modal from 'react-modal'
import config from '../../../../../config'
import { Popup } from 'semantic-ui-react'
import { CoinflipInventoryItem } from '../../../containers'
import { NotificationManager } from 'react-notifications'
import './CoinflipCreateModal.css'
import black from '../../../static/coin-heads.png'
import red from '../../../static/coin-tails.png'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

const { minItems, maxItems, minAmount, itemThreshold } = config.coinflip

export default class CoinflipCreateModal extends Component {

  constructor(props) {
    super(props)

    this.requestClose = this.requestClose.bind(this)
    this.renderModal = this.renderModal.bind(this)
    this.submitGame = this.submitGame.bind(this)
    this.renderItemSelection = this.renderItemSelection.bind(this)
    this.renderCoinSelection = this.renderCoinSelection.bind(this)
    this.renderItems = this.renderItems.bind(this)
    this.nextSlide = this.nextSlide.bind(this)
    this.getTotalSelectedPrice = this.getTotalSelectedPrice.bind(this)
    this.getTotalInventoryPrice = this.getTotalInventoryPrice.bind(this)
    this.getSelectedCount = this.getSelectedCount.bind(this)
    this.clearItems = this.clearItems.bind(this)
    this.getSelectedItems = this.getSelectedItems.bind(this)

    this.state = {
      selected: 'black',
      created: false,
      selectedItems: []
    }
  }

  requestClose() {
    this.props.onClose()
    setTimeout(() => {
      this.setState({
        selected: 'black',
        created: false,
        selectedItems: []
      })
    }, 300)
  }

  renderModal() {
    if (this.state.created) {
      return this.renderItemSelection()
    }
    return this.renderCoinSelection()
  }

  nextSlide() {
    this.setState({
      created: true
    })
    this.props.loadInventory()
  }

  renderCoinSelection() {
    const blackImg = (<img src={black} alt="black" ref="black"
                        className={this.state.selected === 'black' ? 'selected' : ''}
                        onClick={() => this.setState({ selected: 'black' })}
                      />)
    const redImg = (<img src={red} alt="red" ref="red"
                      className={this.state.selected === 'red' ? 'selected' : ''}
                      onClick={() => this.setState({ selected: 'red' })}
                    />)
    return (
      <div>
        <p><span>Select a Coin</span></p>
        <div className="Modal__CreateCoinflip-Coins">
          <Popup
            trigger={blackImg}
            content="0% - 49%"
            offset={-6}
            inverted
          />
          <Popup
            trigger={redImg}
            content="50% - 100%"
            offset={-6}
            inverted
          />
        </div>
        <hr />
        <a onClick={this.nextSlide}>Next</a>
      </div>
    )
  }

  submitGame() {
    const betValue = this.getTotalSelectedPrice(), itemsSelected = this.getSelectedCount()
    if (this.state.selected == null) {
      return NotificationManager.error('Please retry your game creation')
    } else if (betValue < minAmount) {
      return NotificationManager.error(`Bet must be at least $${minAmount}`)
    } else if (itemsSelected < minItems || itemsSelected > maxItems) {
      return NotificationManager.error(`You must select between ${minItems} and ${maxItems} items`)
    }
    this.requestClose()
    this.props.createGame({ side: this.state.selected, items: this.getSelectedItems(), timeout: this.refs.autoCancel.checked })
  }

  renderItemSelection() {
    const betValue = this.getTotalSelectedPrice(), itemsSelected = this.getSelectedCount()
    const betClass = (betValue >= minAmount) ? 'good' : 'bad'
    const itemClass = (itemsSelected >= minItems && itemsSelected <= maxItems) ? 'good' : 'bad'
    return (
      <div>
        <h4>Add your items to the coin flip</h4>
        <p>Min bet ${minAmount} - Max items {maxItems}</p>
        <a className="noselect" onClick={this.props.forceRefreshInventory}>
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
          <div className="Modal__CreateCoinflip-Values">
            <p className="BetValue">Bet Value <span className={betClass}>{`$${betValue}`}</span></p>
            <p className="ItemsSelected">Items Selected <span className={itemClass}>{`${itemsSelected}/${maxItems}`}</span></p>
            <p className="InventoryValue">Inventory Value <span>{`$${this.getTotalInventoryPrice()}`}</span></p>
          </div>
          <p className="InputHeader"><span>Options</span></p>
          <div className="Modal__CreateCoinflip-Options">
            <div>
              <a className="ClearItems" onClick={this.clearItems}>Clear</a>
              <a onClick={this.requestClose}>Cancel</a>
            </div>
            <input type="checkbox" ref="autoCancel" />
            <p>Auto cancel after 30 minutes</p>
          </div>
          <a onClick={this.submitGame} className="CreateGame">Create</a>
        </div>
      </div>
    )
  }

  clearItems() {
    this.setState({
      selectedItems: []
    })
  }

  renderItems() {
    const { items, error, loading } = this.props.inventory
    if (loading) {
       return (
         <i className="fa fa-spinner fa-pulse fa-3x fa-fw ItemLoading"></i>
       )
    } else if (error) {
      return (
        <div className="Modal__CreateCoinflip-Error">
          <span>You do not have any tradeable H1Z1:KotK items or Steam is offline.</span>
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
        disabled={item.price < itemThreshold}
        unselect={() => this.unselectItem(key)}
        select={() => this.selectItem(key)}
      />
    ))
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
      total += Number(this.props.inventory.items[this.state.selectedItems[index]].price)
    }
    return Number(total).toFixed(2)
  }

  getTotalInventoryPrice() {
    let total = 0.00
    for (var index in this.props.inventory.items) {
      total += Number(this.props.inventory.items[index].price)
    }
    return Number(total).toFixed(2)
  }

  render() {
    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.requestClose}
        closeTimeoutMS={200}
        contentLabel="Modal"
        className={'Modal Modal__CreateCoinflip ' + (this.state.created ? 'Modal__CreateCoinflip-Created' : '')}
        overlayClassName={'Modal__Overlay'}
      >
        <div className="Modal__Header">
          <h1>Create a Game</h1>
          <a onClick={this.requestClose}><i className="fa fa-times" /></a>
        </div>
        <div className={'Modal__Content Modal__CreateCoinflip-Content'}>
          { this.renderModal() }
        </div>
      </Modal>
    )
  }

}
