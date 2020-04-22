import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Row, Col } from 'react-bootstrap'
import CoinflipGame from './CoinflipGame'
import CoinflipHistoryGame from './CoinflipHistoryGame'
import CountUp from 'react-countup'
import { NotificationManager } from 'react-notifications'
import { addCoinflipHistoryGame, setCoinFlipped, removeCoinflipGame, updateCoinflipGame, joinCoinflipGame, loadCoinflipGames, receiveCoinflipOffers, requestInventory, forceRefreshInventory, sendNotification, createCoinflipGame, addCoinflipGame, requestCoinflipOffers, cancelCoinflipOffer, resendCoinflipOffer } from '../../actions'
import { CoinflipVerifyModal, CoinflipHistoryModal, CoinflipWatchModal, CoinflipJoinModal, CoinflipOffersModal, CoinflipCreateModal, TradeOfferModal } from '../../components'
import './Coinflip.css'

class Coinflip extends Component {

  constructor(props) {
    super(props)

    this.openCreateModal = this.openCreateModal.bind(this)
    this.renderGames = this.renderGames.bind(this)
    this.cancelOffer = this.cancelOffer.bind(this)
    this.resendOffer = this.resendOffer.bind(this)
    this.hasGameFlipped = this.hasGameFlipped.bind(this)

    this.state = {
      createModal: false,
      offersModal: false,
      tradeOfferModal: false,
      tradeOfferObject: null,
      joining: {
        open: false,
        game: null
      },
      watching: {
        open: false,
        game: null
      },
      history: {
        open: false,
        game: null
      },
      verify: {
        open: false,
        game: null
      },
      currentGames: true,
      historyGames: true
    }

    this.totalValueOld = 0.00
    this.totalItemsOld = 0
    this.totalGamesOld = 0
  }

  componentWillMount() {
    document.title = "Coinflip - H1Z1Brawl"
    this.props.loadCoinflipGames()

    this.props.secureSocket.on('COINFLIP_OFFER_ERROR', ({ error }) => {
      NotificationManager.error(`Error creating trade offer: ${error}`)
    })

    this.props.secureSocket.on('COINFLIP_OFFER', (offer) => {
      this.setState({
        tradeOfferModal: true,
        tradeOfferObject: offer
      })
    })

    this.props.publicSocket.on('COINFLIP_NEW_GAME', this.props.addCoinflipGame)
    this.props.secureSocket.on('COINFLIP_RECEIVE_OFFERS', this.props.receiveCoinflipOffers)
    this.props.publicSocket.on('COINFLIP_UPDATE_GAME', this.props.updateCoinflipGame)
    this.props.publicSocket.on('COINFLIP_REMOVE_GAME', this.props.removeCoinflipGame)
    this.props.publicSocket.on('COINFLIP_ADD_HISTORY', this.props.addCoinflipHistoryGame)
  }

  componentWillUnmount() {
    this.props.secureSocket.off('COINFLIP_OFFER_ERROR')
    this.props.publicSocket.off('COINFLIP_NEW_GAME')
    this.props.secureSocket.off('COINFLIP_OFFER')
    this.props.secureSocket.off('COINFLIP_RECEIVE_OFFERS')
    this.props.publicSocket.off('COINFLIP_UPDATE_GAME')
    this.props.publicSocket.off('COINFLIP_REMOVE_GAME')
    this.props.publicSocket.off('COINFLIP_ADD_HISTORY')
  }

  componentWillReceiveProps(nextProps) {
    this.checkWatching(nextProps)
  }

  checkWatching(props) {
    if (!this.state.watching.game) {
      return
    }
    for (const index in props.coinflip.games) {
      const game = props.coinflip.games[index]
      if (game._id === this.state.watching.game._id) {
        this.setState({
          watching: {
            ...this.state.watching,
            game: game
          }
        })
      }
    }
  }

  openCreateModal() {
    if (this.props.user && this.props.user.tradeUrl) {
      return this.setState({ createModal: true })
    }
    NotificationManager.error('You must set your trade URL before creating a game')
  }

  renderGames() {
    const games = this.sortedGames()
    return games.map((game, key) => (
      <CoinflipGame
        game={game}
        key={key}
        onWatch={() => this.setState({ watching: { open: true, game: game } })}
        onJoin={() => this.setState({ joining: { open: true, game: game } })} />
    ))
  }

  renderHistoryGames() {
    return this.props.coinflip.historyGames.map((game, key) => (
      <CoinflipHistoryGame
        game={game}
        key={key}
        onVerify={() => this.setState({ verify: { open: true, game: game } })}
        onView={() => this.setState({ history: { open: true, game: game } })} />
    ))
  }

  sortedGames() {
    return this.props.coinflip.games.sort((a, b) => {
      const aTotal = this.getTotalGameValue(a), bTotal = this.getTotalGameValue(b)
      return bTotal - aTotal
    })
  }

  getTotalGameValue({ creator, joiner }) {
    let total = 0.00
    for (let i = 0; i < creator.items.length; i++) {
      const item = creator.items[i]
      total += item ? (item.price ? Number(item.price) : 0.00) : 0.00
    }
    for (let i = 0; i < joiner.items.length; i++) {
      const item = joiner.items[i]
      total += item ? (item.price ? Number(item.price) : 0.00) : 0.00
    }
    return Number(total).toFixed(2)
  }

  cancelOffer(offer) {
    if (offer && offer.botId) {
      this.props.cancelCoinflipOffer(offer)
    }
  }

  resendOffer(offer) {
    if (offer && offer.botId) {
      this.props.resendCoinflipOffer(offer)
    }
  }

  getOpenGames() {
    const open = this.props.coinflip.games.length
    const from = this.totalGamesOld + 0
    this.totalGamesOld = open
    return (
      <CountUp
        start={from}
        end={open}
        duration={2}
      />
    )
  }

  getTotalItems() {
    const { games } = this.props.coinflip
    let items = 0
    for (const index in games) {
      items += (parseInt(games[index].creator.items.length) + parseInt(games[index].joiner.items.length))
    }
    const from = this.totalItemsOld + 0
    this.totalItemsOld = items
    return (
      <CountUp
        start={from}
        end={items}
        duration={2}
      />
    )
  }

  getTotalValue() {
    const { games } = this.props.coinflip
    let value = 0
    for (const index in games) {
      for (const i1 in games[index].creator.items) {
        value += parseFloat(games[index].creator.items[i1].price)
      }
      for (const i2 in games[index].joiner.items) {
        value += parseFloat(games[index].joiner.items[i2].price)
      }
    }
    const from = this.totalValueOld + 0
    this.totalValueOld = value
    return (
      <CountUp
        start={from}
        end={value}
        duration={2}
        decimals={2}
        prefix={'$'}
      />
    )
  }

  hasGameFlipped(game) {
    for (const index in this.props.coinflip.flippedGames) {
      const id = this.props.coinflip.flippedGames[index]
      if (game._id == id) {
        return true
      }
    }
    return false
  }

  render() {
    return (
      <div className="Coinflip">
        <CoinflipVerifyModal
          isOpen={this.state.verify.open}
          onClose={() => this.setState({ verify: { game: null, open: false } })}
          game={this.state.verify.game}
        />
        <CoinflipWatchModal
          isOpen={this.state.watching.open}
          onClose={() => this.setState({ watching: { game: null, open: false } })}
          game={this.state.watching.game}
          setCoinFlipped={this.props.setCoinFlipped}
          hasGameFlipped={this.hasGameFlipped}
        />
        <CoinflipHistoryModal
          isOpen={this.state.history.open}
          onClose={() => this.setState({ history: { game: null, open: false } })}
          game={this.state.history.game}
        />
        <CoinflipJoinModal
          isOpen={this.state.joining.open}
          onClose={() => this.setState({ joining: { ...this.state.joining, open: false } })}
          inventory={this.props.inventory}
          loadInventory={this.props.requestInventory}
          forceRefreshInventory={this.props.forceRefreshInventory}
          game={this.state.joining.game}
          joinGame={this.props.joinCoinflipGame}
        />
        <CoinflipOffersModal
          isOpen={this.state.offersModal}
          onClose={() => this.setState({ offersModal: false })}
          requestOffers={this.props.requestCoinflipOffers}
          offers={this.props.coinflip.offers}
          cancelOffer={this.cancelOffer}
          resendOffer={this.resendOffer}
          isResending={this.props.coinflip.resending}
        />
        <TradeOfferModal
          isOpen={this.state.tradeOfferModal}
          onClose={() => this.setState({ tradeOfferModal: false, tradeOfferObject: null })}
          tradeOffer={this.state.tradeOfferObject}
        />
        <CoinflipCreateModal
          isOpen={this.state.createModal}
          onClose={() => this.setState({ createModal: false })}
          inventory={this.props.inventory}
          loadInventory={this.props.requestInventory}
          forceRefreshInventory={this.props.forceRefreshInventory}
          createGame={this.props.createCoinflipGame}
        />
        <div className="Coinflip__Info">
          <p>Add <span>H1Z1Brawl.com</span> in your name and enjoy <span>5%</span> less comission on all coin flips!</p>
        </div>
        <div className="Coinflip__Header">
          <Row>
            <Col md={3} sm={4} className="Coinflip__Header-Stat">
              <h1>
                <p>{ this.getOpenGames() }</p>
                <span className="sub">Current Games</span>
              </h1>
            </Col>
            <Col md={3} sm={4} className="Coinflip__Header-Stat">
            <h1>
              <p>{ this.getTotalItems() }</p>
              <span className="sub">Total Items</span>
            </h1>
            </Col>
            <Col md={3} sm={4} className="Coinflip__Header-Stat">
            <h1>
              <p>{ this.getTotalValue() }</p>
              <span className="sub">Total Value</span>
            </h1>
            </Col>
            <Col md={3} sm={12} className="Coinflip__Header-Buttons">
              <a className="noselect create" onClick={this.openCreateModal}>
                <span>Create</span>
                <div>
                  <i className="fa fa-plus-square-o"></i>
                </div>
              </a>
              <a className="noselect history" onClick={() => this.setState({ offersModal: true })}>
                <span>Offers</span>
                <div>
                  <i className="fa fa-wrench"></i>
                </div>
              </a>
            </Col>
          </Row>
        </div>

        <div className="Coinflip__Body">
          <table>
            <thead>
              <tr>
              <th className="SideLabel"><span>Side</span></th>
              <th className="Players"><span>Players</span></th>
              <th className="Items"><span>Items</span></th>
              <th className="Value"><span>Value</span></th>
              <th className="Status"><span>Status</span></th>
              <th className="Actions"><span>Actions</span></th>
              </tr>
            </thead>
            <tbody className={`${this.state.currentGames ? '' : 'fadee'}`}>
              { this.renderGames() }
            </tbody>
            <i className={`Switch fa ${this.state.currentGames ? 'fa-chevron-down' : 'fa-chevron-up'}`} onClick={() => this.setState({ currentGames: !this.state.currentGames })} />
          </table>
          {this.props.coinflip.loading &&
            <div className="Coinflip--Loading">
              <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            </div>
          }
        </div>

        <div className="Coinflip__Body">
          <table>
            <thead>
              <tr>
                <th className="SideLabel"><span>Side</span></th>
                <th className="Players"><span>Players</span></th>
                <th className="Items"><span>Items</span></th>
                <th className="Value"><span>Value</span></th>
                <th className="Result"><span>Result</span></th>
                <th className="Actions"><span>Actions</span></th>
              </tr>
            </thead>
            <tbody className={`${this.state.historyGames ? '' : 'fadee'}`}>
              { this.renderHistoryGames() }
            </tbody>
            <i className={`Switch fa ${this.state.historyGames ? 'fa-chevron-down' : 'fa-chevron-up'}`} onClick={() => this.setState({ historyGames: !this.state.historyGames })} />
          </table>
          {this.props.coinflip.historyLoading &&
            <div className="Coinflip--Loading">
              <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
            </div>
          }
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    inventory: state.user.inventory,
    user: state.auth.user,
    coinflip: state.coinflip,
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    requestInventory,
    forceRefreshInventory,
    sendNotification,
    createCoinflipGame,
    addCoinflipGame,
    requestCoinflipOffers,
    cancelCoinflipOffer,
    resendCoinflipOffer,
    receiveCoinflipOffers,
    loadCoinflipGames,
    joinCoinflipGame,
    updateCoinflipGame,
    removeCoinflipGame,
    setCoinFlipped,
    addCoinflipHistoryGame
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Coinflip)
