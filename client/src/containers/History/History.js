import React, { Component } from 'react'
import { Tab, Input, Header, Icon, Dropdown } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import HistoryTableCoinflip from './HistoryTableCoinflip'
import HistoryTableJackpot from './HistoryTableJackpot'
import config from '../../../../config'

import {
  historyLoadCoinflip,
  historyLoadJackpot
} from '../../actions'

import './History.css'

const sortOptions = [
  {
    key: 'date ascending',
    text: 'Latest',
    value: 'date ascending'
  },
  {
    key: 'date descending',
    text: 'Oldest',
    value: 'date descending'
  },
  {
    key: 'value descending',
    text: 'Highest Value',
    value: 'value descending'
  },
  {
    key: 'value ascending',
    text: 'Lowest Value',
    value: 'value ascending'
  }
]

class History extends Component {

  constructor(props) {
    super(props)

    this.renderJackpot = this.renderJackpot.bind(this)
    this.renderCoinflip = this.renderCoinflip.bind(this)
    this.updateJackpotSearch = this.updateJackpotSearch.bind(this)
    this.updateCoinflipSearch = this.updateCoinflipSearch.bind(this)

    this.panes = [
      { menuItem: 'Jackpot', render: this.renderJackpot },
      { menuItem: 'Coinflip', render: this.renderCoinflip }
    ]

    this.state = {
      coinflipFilter: 'date ascending',
      jackpotFilter: 'date ascending',
      coinflipSearch: null,
      jackpotSSearch: null
    }
  }

  componentWillMount() {
    document.title = 'History - ' + config.metadata.name
  }

  onDropdownChange(game, data) {
    if (game === 'coinflip') {
      this.setState({ coinflipFilter: data.value })
    } else {
      this.setState({ jackpotFilter: data.value })
    }
  }

  updateJackpotSearch(event) {
    if (event.key === 'Enter') {
      this.setState({ jackpotSearch: event.target.value })
    }
  }

  updateCoinflipSearch(event) {
    if (event.key === 'Enter') {
      this.setState({ coinflipSearch: event.target.value })
    }
  }

  renderJackpot() {
    const { jackpot } = this.props.history
    return (
      <Tab.Pane className="Pane">
        <div className="History__Header">
          <Input
            placeholder={'Search for a player...'}
            className="History__Input"
            onKeyDown={this.updateJackpotSearch}
          />
          <Dropdown text='Sort by' icon='filter' floating labeled button className='icon' options={sortOptions} onChange={(event, data) => this.onDropdownChange('jackpot', data)} />
        </div>
        <HistoryTableJackpot data={jackpot.data} playerSearch={this.state.jackpotSearch} jackpot={jackpot} loadHistory={this.props.historyLoadJackpot} filter={this.state.jackpotFilter} />
      </Tab.Pane>
    )
  }

  renderCoinflip() {
    const { coinflip } = this.props.history
    return (
      <Tab.Pane className="Pane">
        <div className="History__Header">
          <Input
            placeholder={'Search for a player...'}
            className="History__Input"
            onKeyDown={this.updateCoinflipSearch}
          />
          <Dropdown text='Sort by' icon='filter' floating labeled button className='icon' options={sortOptions} onChange={(event, data) => this.onDropdownChange('coinflip', data)} />
        </div>
        <HistoryTableCoinflip playerSearch={this.state.coinflipSearch} data={coinflip.data} coinflip={coinflip} loadHistory={this.props.historyLoadCoinflip} filter={this.state.coinflipFilter}/>
      </Tab.Pane>
    )
  }

  render() {
    return (
      <Tab panes={this.panes} className="History__Tab" />
    )
  }

}

const mapStateToProps = state => {
  return {
    history: state.history
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    historyLoadJackpot,
    historyLoadCoinflip
  }, dispatch)
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(History)
