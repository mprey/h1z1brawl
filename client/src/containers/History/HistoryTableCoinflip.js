import React, { Component } from 'react'
import { Table, Menu, Icon, Popup } from 'semantic-ui-react'
import { didCreatorWin, getCoinflipTotal } from '../../util/coinflip'
import moment from 'moment'

import black from '../../static/coin-heads.png'
import red from '../../static/coin-tails.png'

const ITEMS_PER_PAGE = 10
const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

class HistoryTableCoinflip extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentPage: 1
    }

    this.data = props.data
  }

  componentWillMount() {
    if (!this.props.coinflip.loaded && !this.props.coinflip.loading) {
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
    this.data = this.props.data.filter((game) => {
      if (game.creator.name && ~game.creator.name.toLowerCase().indexOf(filter)) {
        return true
      } else if (game.joiner.name && ~game.joiner.name.toLowerCase().indexOf(filter)) {
        return true
      }
      return false
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
        const aTotal = getCoinflipTotal(a)
        const bTotal = getCoinflipTotal(b)
        return bTotal - aTotal
      })
    } else if (filter === 'value ascending') {
      this.data.sort((a, b) => {
        const aTotal = getCoinflipTotal(a)
        const bTotal = getCoinflipTotal(b)
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

  renderItems(game) {
    const items = game.creator.items.concat(game.joiner.items)
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

  renderCoinflipGame(game, index) {
    const creatorWin = didCreatorWin(game)

    const winningSide = creatorWin ? (game.startingSide === 'black' ? black : red) : (game.startingSide === 'black' ? red : black)
    const totalValue = getCoinflipTotal(game)

    const winner = creatorWin ? game.creator : game.joiner
    const loser = creatorWin ? game.joiner : game.creator

    const items = this.renderItems(game)

    const date = moment(new Date(game.dateCompleted)).fromNow()

    return (
      <Table.Row key={index}>
        <Table.Cell collapsing textAlign='center'><img src={winningSide} alt="side" /></Table.Cell>
        <Table.Cell collapsing textAlign='center'>
          <Popup
            inverted
            content={winner.name}
            trigger={
              <a href={`https://steamcommunity.com/profiles/${winner.id}`} target="_blank"><img src={winner.image} alt="winner" /></a>
            }
          />
        </Table.Cell>
        <Table.Cell collapsing textAlign='center'>
          <Popup
            inverted
            content={loser.name}
            trigger={
              <a href={`https://steamcommunity.com/profiles/${loser.id}`} target="_blank"><img src={loser.image} alt="loser" /></a>
            }
          />
        </Table.Cell>
        <Table.Cell>{items}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>${totalValue}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>{date}</Table.Cell>
      </Table.Row>
    )
  }

  renderCoinflipTable() {
    const { data } = this
    const { currentPage } = this.state
    if (!data) {
      return null
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const selection = data.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return selection.map((game, index) => this.renderCoinflipGame(game, index))
  }

  render() {
    if (this.props.coinflip.loading) {
      return <div className="ui active centered huge inline loader"></div>
    }

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Side</Table.HeaderCell>
            <Table.HeaderCell>Winner</Table.HeaderCell>
            <Table.HeaderCell>Loser</Table.HeaderCell>
            <Table.HeaderCell>Items</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          { this.renderCoinflipTable() }
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan='6'>
              { this.renderPaginationItems() }
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
    )
  }

}

export default HistoryTableCoinflip
