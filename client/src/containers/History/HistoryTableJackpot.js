import React, { Component } from 'react'
import { Table, Menu, Icon, Popup } from 'semantic-ui-react'
import moment from 'moment'
import { getJackpotTotal } from '../../util/jackpot'

const ITEMS_PER_PAGE = 10
const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

class HistoryTableJackpot extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentPage: 1
    }

    this.data = props.data
  }

  componentWillMount() {
    if (!this.props.jackpot.loaded && !this.props.jackpot.loaded) {
      this.props.loadHistory()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      this.data = nextProps.data
    }

    if (nextProps.filter !== this.props.filter) {
      this.sortData(nextProps.filter)
    } else if (nextProps.playerSearch && nextProps.playerSearch !== this.props.playerSearch && nextProps.playerSearch !== "") {
      this.sortByPlayerSearch(nextProps.playerSearch)
    }
  }

  sortByPlayerSearch(name) {
    const filter = name.toLowerCase()
    this.data = this.props.data.filter((round) => {
      return round.winner.name && ~round.winner.name.toLowerCase().indexOf(filter)
    })
    this.setState({ currentPage: 1 })
  }

  sortData(filter) {
    if (filter === 'date ascending') {
      this.data.sort((a, b) => {
        return new Date(b.dateCompleted) - new Date(a.dateCompleted)
      })
    } else if (filter === 'date descending') {
      this.data.sort((a, b) => {
        return new Date(a.dateCompleted) - new Date(b.dateCompleted)
      })
    } else if (filter === 'value descending') {
      this.data.sort((a, b) => {
        const aTotal = getJackpotTotal(a)
        const bTotal = getJackpotTotal(b)
        return bTotal - aTotal
      })
    } else if (filter === 'value ascending') {
      this.data.sort((a, b) => {
        const aTotal = getJackpotTotal(a)
        const bTotal = getJackpotTotal(b)
        return aTotal - bTotal
      })
    }
    this.setState({ currentPage: 1 })
  }

  get maxPages() {
    const { data } = this
    if (!data || data.length === 0) {
      return 0
    }

    return Math.ceil(data.length / ITEMS_PER_PAGE)
  }

  setCurrentPage(pageNumber) {
    if (pageNumber === 0) {
      pageNumber = 1
    } else if (pageNumber > this.maxPages) {
      pageNumber = this.maxPages
    }
    this.setState({ currentPage: pageNumber })
  }

  renderPaginationItems() {
    const maxPages = this.maxPages
    if (maxPages === 0) {
      return (
        <Menu floated='right' pagination>
          <Menu.Item as='a' icon>
            <Icon name='left chevron' />
          </Menu.Item>
          <Menu.Item as='a'>0</Menu.Item>
          <Menu.Item as='a' icon>
            <Icon name='right chevron' />
          </Menu.Item>
        </Menu>
      )
    }
    var { currentPage } = this.state
    if (currentPage > maxPages) {
      currentPage = maxPages
    }

    return (
      <Menu floated='right' pagination>
        <Menu.Item as='a' icon onClick={() => this.setCurrentPage(currentPage - 1)}>
          <Icon name='left chevron' />
        </Menu.Item>
        {((currentPage - 2) > 0) &&
          <Menu.Item as='a' onClick={() => this.setCurrentPage(currentPage - 2)}>{currentPage - 2}</Menu.Item>
        }
        {((currentPage - 1) > 0) &&
          <Menu.Item as='a' onClick={() => this.setCurrentPage(currentPage - 1)}>{currentPage - 1}</Menu.Item>
        }
        <Menu.Item as='a' active>{currentPage}</Menu.Item>
        {((currentPage + 1) <= maxPages) &&
          <Menu.Item as='a' onClick={() => this.setCurrentPage(currentPage + 1)}>{currentPage + 1}</Menu.Item>
        }
        {((currentPage + 2) <= maxPages) &&
          <Menu.Item as='a' onClick={() => this.setCurrentPage(currentPage + 2)}>{currentPage + 2}</Menu.Item>
        }
        <Menu.Item as='a' icon onClick={() => this.setCurrentPage(currentPage + 1)}>
          <Icon name='right chevron' />
        </Menu.Item>
      </Menu>
    )
  }

  renderItems(round) {
    const items = []
    for (const index in round.deposits) {
      items.push(...round.deposits[index].items)
    }
    const sorted = items.sort((a, b) => b.price - a.price)

    return sorted.map((item, index) => (
      <Popup
        inverted
        key={index}
        trigger={<img className="History__GameItem" src={`${IMAGE_URL}${item.icon_url}`} alt="image" />}
        content={item.name}
      />
    ))
  }

  renderJackpotRound(round, index) {
    const roundID = round._id
    const winner = round.winner
    const items = this.renderItems(round)
    const totalValue = getJackpotTotal(round)
    const date = moment(new Date(round.dateCompleted)).fromNow()

    return (
      <Table.Row key={index}>
        <Table.Cell collapsing textAlign='center'>#{roundID}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>
          <Popup
            inverted
            content={winner.name}
            trigger={
              <a href={`https://steamcommunity.com/profiles/${winner.id}`} target="_blank"><img src={winner.image} alt="winner" /></a>
            }
          />
        </Table.Cell>
        <Table.Cell>{items}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>${totalValue}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>{date}</Table.Cell>
      </Table.Row>
    )
  }

  renderJackpotTable() {
    const { data } = this
    const { currentPage } = this.state
    if (!data) {
      return null
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const selection = data.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return selection.map((game, index) => this.renderJackpotRound(game, index))
  }

  render() {
    if (this.props.jackpot.loading) {
      return <div className="ui active centered huge inline loader"></div>
    }

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell singleLine>Round ID</Table.HeaderCell>
            <Table.HeaderCell>Winner</Table.HeaderCell>
            <Table.HeaderCell>Items</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          { this.renderJackpotTable() }
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='5'>
              { this.renderPaginationItems() }
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    )
  }

}

export default HistoryTableJackpot
