import React, { Component } from 'react'
import { Table, Menu, Icon, Popup } from 'semantic-ui-react'
import moment from 'moment'

const ITEMS_PER_PAGE = 10
const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

class AdminTradesTable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentPage: 1
    }

    this.data = props.rake.data
  }

  componentWillMount() {
    const { rake, loadRake } = this.props
    if (!rake.loaded && !rake.loading) {
      loadRake()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.rake.data !== this.props.rake.data) {
      this.data = nextProps.rake.data
    }

    if (nextProps.filter !== this.props.filter) {
      this.sortData(nextProps.filter)
    } else if (nextProps.search && nextProps.search !== this.props.search) {
      this.sortBySearch(nextProps.search)
    }
  }

  sortBySearch(itemName) {
    this.data = this.props.rake.data.filter((item) => {
      if (item.name && ~item.name.toLowerCase().indexOf(itemName.toLowerCase())) {
        return true
      }
      return false
    })
    this.setState({ currentPage: 1 })
  }

  sortData(filter) {
    if (filter === 'date ascending') {
      this.data.sort((a, b) => {
        return new Date(b.dateAdded) - new Date(a.dateAdded)
      })
    } else if (filter === 'date descending') {
      this.data.sort((a, b) => {
        return new Date(a.dateAdded) - new Date(b.dateAdded)
      })
    } else if (filter === 'available') {
      this.data.sort((a, b) => {
        return a.withdrawn - b.withdrawn
      })
    } else if (filter === 'withdrawn') {
      this.data.sort((a, b) => {
        return b.withdrawn - a.withdrawn
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

  renderItem(item) {
    return (
      <Popup
        inverted
        trigger={<img className="Admin__RakeItem" src={`${IMAGE_URL}${item.icon_url}`} alt="item" />}
        content={item.name}
      />
    )
  }

  renderWithdraw(item) {
    if (item.withdrawn) {
      return (
        <Table.Cell disabled collapsing textAlign='center'>
          <a className="Admin__Withdraw-Disable">
            Withdraw
          </a>
        </Table.Cell>
      )
    } else {
      return (
        <Table.Cell collapsing textAlign='center'>
          <a className="Admin__Withdraw" onClick={() => this.props.withdrawRake(item)}>
            Withdraw
          </a>
        </Table.Cell>
      )
    }
  }

  renderRakeItem(item, index) {
    const date = moment(new Date(item.dateAdded)).fromNow()
    return (
      <Table.Row key={index}>
        <Table.Cell collapsing textAlign='center'>
          { this.renderItem(item) }
        </Table.Cell>
        <Table.Cell collapsing textAlign='center'>
          ${ item.price }
        </Table.Cell>
        <Table.Cell collapsing textAlign='center'>
          <a href={`https://steamcommunity.com/profiles/${item.botId}`} target="_blank">{item.botId}</a>
        </Table.Cell>
        <Table.Cell collapsing textAlign='center'>{date}</Table.Cell>
        { this.renderWithdraw(item) }
      </Table.Row>
    )
  }

  renderTable() {
    const { data } = this
    const { currentPage } = this.state
    if (!data) {
      return null
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const selection = data.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return selection.map((item, index) => this.renderRakeItem(item, index))
  }

  render() {
    if (this.props.rake.loading) {
      return <div className="ui active centered huge inline loader"></div>
    }

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Item</Table.HeaderCell>
            <Table.HeaderCell>Price</Table.HeaderCell>
            <Table.HeaderCell>Bot ID</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Withdraw</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          { this.renderTable() }
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

export default AdminTradesTable
