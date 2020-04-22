import React, { Component } from 'react'
import { Tab, Input, Header, Icon, Dropdown } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import AdminTradesTable from './AdminTradesTable'
import config from '../../../../../config'

import {
  loadCoinflipOffers,
  loadJackpotOffers,
  resendJackpotOffer,
  resendCoinflipOffer
} from '../../../actions'

const sortOptions = [
  {
    key: 'incomplete',
    text: 'Incomplete',
    value: 'incomplete'
  },
  {
    key: 'completed',
    text: 'Completed',
    value: 'completed'
  },
  {
    key: 'date descending',
    text: 'Date Descending',
    value: 'date descending'
  },
  {
    key: 'date ascending',
    text: 'Date Ascending',
    value: 'date ascending'
  }
]

class AdminTradeOffers extends Component {

  constructor(props) {
    super(props)

    this.updateJackpotSearch = this.updateJackpotSearch.bind(this)
    this.updateCoinflipSearch = this.updateCoinflipSearch.bind(this)
    this.renderJackpot = this.renderJackpot.bind(this)
    this.renderCoinflip = this.renderCoinflip.bind(this)

    this.panes = [
      { menuItem: 'Jackpot', render: this.renderJackpot },
      { menuItem: 'Coinflip', render: this.renderCoinflip }
    ]

    this.state = {
      jackpot: {
        filter: 'incomplete',
        search: null
      },
      coinflip: {
        filter: 'incomplete',
        search: null
      }
    }
  }

  onDropdownChange(game, data) {
    if (game === 'coinflip') {
      this.setState({ coinflip: { filter: data.value } })
    } else {
      this.setState({ jackpot: { filter: data.value } })
    }
  }

  componentWillMount() {
    document.title = 'Admin - ' + config.metadata.name
  }

  updateJackpotSearch(event) {
    if (event.key === 'Enter') {
      this.setState({ jackpot: { search: event.target.value } })
    }
  }

  updateCoinflipSearch(event) {
    if (event.key === 'Enter') {
      this.setState({ coinflip: { search: event.target.value } })
    }
  }

  renderJackpot() {
    const { filter, search } = this.state.jackpot
    const { jackpotOffers, loadJackpotOffers, resendJackpotOffer } = this.props
    return (
      <Tab.Pane className="Pane">
        <div className="History__Header">
          <Input
            placeholder={'Search for a Steam64ID...'}
            className="History__Input"
            onKeyDown={this.updateJackpotSearch}
          />
          <Dropdown text='Sort by' icon='filter' floating labeled button className='icon' options={sortOptions} onChange={(event, data) => this.onDropdownChange('jackpot', data)} />
        </div>
        <AdminTradesTable resendOffer={resendJackpotOffer} search={search} offers={jackpotOffers} loadOffers={loadJackpotOffers} filter={filter} />
      </Tab.Pane>
    )
  }

  renderCoinflip() {
    const { filter, search } = this.state.coinflip
    const { coinflipOffers, loadCoinflipOffers, resendCoinflipOffer } = this.props
    return (
      <Tab.Pane className="Pane">
        <div className="History__Header">
          <Input
            placeholder={'Search for a Steam64ID...'}
            className="History__Input"
            onKeyDown={this.updateCoinflipSearch}
          />
          <Dropdown text='Sort by' icon='filter' floating labeled button className='icon' options={sortOptions} onChange={(event, data) => this.onDropdownChange('coinflip', data)} />
        </div>
        <AdminTradesTable resendOffer={resendCoinflipOffer} search={search} offers={coinflipOffers} loadOffers={loadCoinflipOffers} filter={filter} />
      </Tab.Pane>
    )
  }

  render() {
    return (
      <Tab panes={this.panes} className="Admin__Tab" />
    )
  }

}

const mapStateToProps = (state) => {
  return {
    coinflipOffers: state.coinflip.admin.offers,
    jackpotOffers: state.jackpot.admin.offers
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    loadCoinflipOffers,
    loadJackpotOffers,
    resendCoinflipOffer,
    resendJackpotOffer
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminTradeOffers)
