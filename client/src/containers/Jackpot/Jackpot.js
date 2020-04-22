import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Popup } from 'semantic-ui-react'
import { Grid, Row, Col } from 'react-bootstrap'
import { jackpot } from '../../../../config'
import { Link } from 'react-router-dom'
import { NotificationManager } from 'react-notifications'
import { JackpotDepositModal, CountDownTimer, TradeOfferModal } from '../../components'
import JackpotRound from './JackpotRound'
import JackpotRoller from './JackpotRoller'
import CircularProgressbar from 'react-circular-progressbar';
import { getWinnerChance, getJackpotTotal, getJackpotStats, getTotalJackpotItems, getSortedItems } from '../../util/jackpot'
import { startJackpotRolling, loadJackpot, endJackpotRolling, endJackpotRound, newJackpotRound, updateJackpotRound, requestInventory, forceRefreshInventory, depositJackpotItems } from '../../actions'

import './Jackpot.css'

const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

class Jackpot extends Component {

  constructor(props) {
    super(props)

    this.openDepositModal = this.openDepositModal.bind(this)
    this.isRoundRolling = this.isRoundRolling.bind(this)
    this.stopRolling = this.stopRolling.bind(this)

    this.state = {
      depositModal: false,
      tradeOffer: {
        open: false,
        offer: null
      },
      isRolling: false,
      rollingRound: null
    }
  }

  componentWillMount() {
    this.props.loadJackpot()

    this.props.secureSocket.on('JACKPOT_OFFER_ERROR', ({ error }) => {
      NotificationManager.error(`Error creating trade offer: ${error}`)
    })

    this.props.secureSocket.on('JACKPOT_OFFER', (offer) => {
      this.setState({
        tradeOffer: {
          open: true,
          offer: offer
        }
      })
    })

    this.props.publicSocket.on('JACKPOT_NEW_ROUND', this.props.newJackpotRound)
    this.props.publicSocket.on('JACKPOT_END_ROUND', (round) => {
      this.props.endJackpotRound(round)
      this.startRollingAnimation(round)
    })
    this.props.publicSocket.on('JACKPOT_UPDATE_ROUND', this.props.updateJackpotRound)
  }

  componentWillUnmount() {
    this.props.publicSocket.off('JACKPOT_NEW_ROUND')
    this.props.publicSocket.off('JACKPOT_END_ROUND')
    this.props.publicSocket.off('JACKPOT_UPDATE_ROUND')
    this.props.secureSocket.off('JACKPOT_OFFER')
    this.props.secureSocket.off('JACKPOT_OFFER_ERROR')
  }

  openDepositModal() {
    if (this.props.user && this.props.user.tradeUrl) {
      return this.setState({ depositModal: true })
    } else if (this.props.jackpot.depositing) {
      return NotificationManager.error('You are already depositing items')
    }
    NotificationManager.error('Set your trade URL in the settings before playing')
  }

  stopRolling() {
    this.setState({ isRolling: false, displayWinner: true })
    this.props.endJackpotRolling()
  }

  stopDisplayWinner() {
    this.setState({ displayWinner: false, rollingRound: null })
  }

  renderHeaderBar() {
    if (this.props.jackpot.loading) {
      return null
    }

    const { currentRound } = this.props.jackpot

    if (this.state.displayWinner) {
      const winnerChance = getWinnerChance(this.state.rollingRound)
      const total = getJackpotTotal(this.state.rollingRound)
      const { winner } = this.state.rollingRound
      setTimeout(() => {
        this.stopDisplayWinner()
      }, 8 * 1000) /* display the winner for 8 seconds */
      return (
        <div className="Header__Winner">
          <h1><img src={winner.image} alt="winner" /><span>{winner.name}</span> won <span>${Number(total).toFixed(2)}</span> with a <span>{Number(winnerChance).toFixed(2)}%</span> chance!</h1>
        </div>
      )
    } else if (this.state.isRolling) {
      return <JackpotRoller round={this.state.rollingRound} onComplete={this.stopRolling} />
    } else if (currentRound) {
      if (currentRound.deposits.length === 0) {
        return (<p className="Info">No Deposits Yet</p>)
      }
      const items = getSortedItems(currentRound)
      return (
        <div className="Header__Items">
          {items.map((item, key) => (
            <Popup
              content={item.name}
              trigger={
                <div className="Header__Item">
                  <img src={`${IMAGE_URL}${item.icon_url}`} alt="item" />
                  <p>${item.price}</p>
                </div>
              }
              offset={-20}
              inverted
            />
          ))}
        </div>
      )
    }
    return (<p className="Error">ERROR - please refresh</p>)
  }

  startRollingAnimation(round) {
    this.props.startJackpotRolling(round._id)
    this.setState({ isRolling: true, rollingRound: round, displayWinner: false })
  }

  renderJackpotDisplay(jackpotTotal, items) {
    const { currentRound } = this.props.jackpot
    const { gameCountdown } = jackpot.countdowns
    const itemProgression = getTotalJackpotItems(currentRound) / jackpot.game.maxItems * 100
    let countDown = <CountDownTimer secondsRemaining={gameCountdown} totalSeconds={gameCountdown} color="rgb(164, 38, 38)" noText width="100px" height="100px" freeze />
    if (currentRound && currentRound.timerStart) {
      let secondsElapsed = parseInt((new Date().getTime() - new Date(currentRound.timerStart).getTime()) / 1000)
      if (secondsElapsed > gameCountdown) {
        secondsElapsed = gameCountdown
      }
      countDown = <CountDownTimer secondsRemaining={gameCountdown - secondsElapsed} totalSeconds={gameCountdown} color="rgb(164, 38, 38)" noText width="100px" height="100px" />
    }
    return (
      <div>
        { countDown }
        <CircularProgressbar percentage={itemProgression} initialAnimation strokeWidth={15} className="ItemsBar"/>
        <div className="JackpotTimer__Stats">
          <h1>{jackpotTotal}</h1>
          <p>{items}</p>
        </div>
      </div>
    )
  }

  isRoundRolling(roundId) {
    return this.props.jackpot.rollingRound === roundId
  }

  renderGames() {
    if (this.props.jackpot.loading) {
      return (
        <div className="Coinflip--Loading">
          <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
        </div>
      )
    }
    let currentRound = null
    if (this.props.jackpot.currentRound) {
      currentRound = <JackpotRound round={this.props.jackpot.currentRound} />
    }
    return (
      <div className="JackpotRounds">
        { currentRound }
        {this.props.jackpot.historyRounds.map((round, key) => (
          <JackpotRound round={round} key={key} isRoundRolling={this.isRoundRolling} />
        ))}
      </div>
    )
  }

  getStats() {
    if (this.props.jackpot.currentRound) {
      return getJackpotStats(this.props.jackpot.currentRound, this.props.user)
    }
    return ['$0.00', 0, '$0.00', '0.00%', `0/${jackpot.game.maxItems}`]
  }

  render() {
    const [jackpotTotal, currentPlayers, numDeposited, chanceToWin, items] = this.getStats()
    document.title = `${jackpotTotal} - H1Z1Brawl`
    return (
      <Grid className="Jackpot">
        <TradeOfferModal
          isOpen={this.state.tradeOffer.open}
          onClose={() => this.setState({ tradeOffer: { open: false, offer: null }})}
          tradeOffer={this.state.tradeOffer.offer}
        />
        <JackpotDepositModal
          isOpen={this.state.depositModal}
          onClose={() => this.setState({ depositModal: false })}
          inventory={this.props.inventory}
          loadInventory={this.props.requestInventory}
          forceRefreshInventory={this.props.forceRefreshInventory}
          round={this.props.jackpot.currentRound}
          depositItems={this.props.depositJackpotItems}
        />
        <Row>
          <Col className="Header" sm={12}>
            { this.renderHeaderBar() }
          </Col>
          <Col className="Display" sm={12} md={5}>
            <Col className="JackpotTimer "sm={12}>
              { this.renderJackpotDisplay(jackpotTotal, items) }
            </Col>
            <Col className="Ad" sm={12}>
              <p>Put <span>H1Z1Brawl.com</span> in your name and get <span>5%</span> more items!</p>
            </Col>
            <Col sm={6} className="NoLeft">
              <div className="JackpotStat">
                <h2>{jackpotTotal}</h2>
                <p>Total</p>
              </div>
            </Col>
            <Col sm={6} className="NoRight">
              <div className="JackpotStat">
                <h2>{currentPlayers}</h2>
                <p>Players</p>
              </div>
            </Col>
            <Col sm={6} className="NoLeft">
              <div className="JackpotStat">
                <h2>{numDeposited}</h2>
                <p>Deposited</p>
              </div>
            </Col>
            <Col sm={6} className="NoRight">
              <div className="JackpotStat">
                <h2>{chanceToWin}</h2>
                <p>Chance</p>
              </div>
            </Col>
          </Col>
          <Col className="Input" sm={12} md={7}>
            <Col className="Deposit" sm={12}>
              <a className="noselect DepositButton" onClick={this.openDepositModal}>
                <span>Deposit</span>
                <div>
                  <i className="fa fa-plus-square-o"></i>
                </div>
              </a>
              <div className="Data">
                <p>Minimum Value: <span>${jackpot.minAmount}</span></p>
                <p>Items Range: <span>{jackpot.minItems} - {jackpot.maxItems}</span></p>
              </div>
              <Link to="/faq">
                <i className="Info fa fa-question-circle" aria-hidden="true"></i>
              </Link>
            </Col>
            <Col sm={12} className="JackpotRounds__Wrapper">
              { this.renderGames() }
            </Col>
          </Col>
        </Row>
      </Grid>
    )
  }

}

const mapStateToProps = (state) => {
  return {
    inventory: state.user.inventory,
    user: state.auth.user,
    jackpot: state.jackpot,
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadJackpot,
    endJackpotRolling,
    endJackpotRound,
    newJackpotRound,
    updateJackpotRound,
    requestInventory,
    forceRefreshInventory,
    depositJackpotItems,
    startJackpotRolling
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Jackpot)
