import React, { Component } from 'react'
import { Tab, Input, Header, Icon, Dropdown, Button } from 'semantic-ui-react'
import AdminRakeTable from './AdminRakeTable'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import {
  loadRakeHistory,
  withdrawRake,
  withdrawAllRake
} from '../../../actions'

import '../Admin.css'

const sortOptions = [
  {
    key: 'available',
    text: 'Available',
    value: 'available'
  },
  {
    key: 'withdrawn',
    text: 'Withdrawn',
    value: 'withdrawn'
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

class AdminRake extends Component {

  constructor(props) {
    super(props)

    this.updateSearch = this.updateSearch.bind(this)

    this.state = {
      filter: 'available',
      search: null
    }
  }

  onDropdownChange(data) {
    this.setState({ filter: data.value })
  }

  componentWillMount() {
    document.title = 'Admin - H1Z1Brawl'
  }

  updateSearch(event) {
    if (event.key === 'Enter') {
      this.setState({ search: event.target.value })
    }
  }

  render() {
    const { loadRakeHistory, rake, withdrawRake } = this.props
    const { search, filter } = this.state
    return (
      <div className="Admin">
        <div className="Admin__Header">
          <Input
            placeholder={'Search for an item...'}
            className="History__Input"
            onKeyDown={this.updateSearch}
          />
          <Button text='Withdraw All' floating labeled onClick={this.props.withdrawAllRake}>Withdraw All</Button>
          <Dropdown text='Sort by' icon='filter' floating labeled button className='icon' options={sortOptions} onChange={(event, data) => this.onDropdownChange(data)} />
        </div>
        <AdminRakeTable withdrawRake={withdrawRake} loadRake={loadRakeHistory} rake={rake} search={search} filter={filter} />
      </div>
    )
  }

}

const mapStateToProps = state => {
  return {
    rake: state.admin.rake
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({
    loadRakeHistory,
    withdrawRake,
    withdrawAllRake
  }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminRake)
