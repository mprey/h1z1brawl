import React, { Component } from 'react'
import { Table, Menu, Icon, Popup } from 'semantic-ui-react'
import moment from 'moment'

const failureReasons = {
  "1": "Invalid",
	"2": "Active",
	"3": "Accepted",
	"4": "Countered",
	"5": "Expired",
	"6": "Canceled",
	"7": "Declined",
	"8": "InvalidItems",
	"9": "CreatedNeedsConfirmation",
	"10": "CanceledBySecondFactor",
	"11": "InEscrow"
}

const ITEMS_PER_PAGE = 10
const IMAGE_URL = 'https://steamcommunity-a.akamaihd.net/economy/image/'

class AdminTradesTable extends Component {

  constructor(props) {
    super(props)

    this.state = {
      currentPage: 1
    }

    this.data = props.offers.data
  }

  componentWillMount() {
    const { offers, loadOffers, filter } = this.props
    if (!offers.loaded && !offers.loading) {
      loadOffers()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.offers.data !== this.props.offers.data) {
      this.data = nextProps.offers.data
      if (this.data && nextProps.filter) {
        this.sortData(nextProps.filter)
      }
    }

    if (!nextProps.offers.loaded && !nextProps.offers.loading) {
      nextProps.loadOffers()
    }

    if (nextProps.filter !== this.props.filter) {
      this.sortData(nextProps.filter)
    } else if (nextProps.search && nextProps.search !== this.props.search && nextProps.search !== "") {
      this.sortBySearch(nextProps.search)
    }
  }

  sortBySearch(userId) {
    this.data = this.props.offers.data.filter((offer) => {
      if (offer.userId && ~offer.userId.indexOf(userId)) {
        return true
      }
      return false
    })
    this.setState({ currentPage: 1 })
  }

  sortData(filter) {
    if (filter === 'date ascending') {
      this.data.sort((a, b) => {
        return new Date(b.created) - new Date(a.created)
      })
    } else if (filter === 'date descending') {
      this.data.sort((a, b) => {
        return new Date(a.created) - new Date(b.created)
      })
    } else if (filter === 'incomplete') {
      this.data.sort((a, b) => {
        return a.completed - b.completed
      })
    } else if (filter === 'completed') {
      this.data.sort((a, b) => {
        return a.failed - b.failed
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

  renderItems(items) {
    if (items) {
      const sorted = items.sort((a, b) => b.price - a.price)
      return sorted.map((item, index) => (
        <Popup
          inverted
          key={index}
          trigger={<img className="Admin__OfferItem" src={`${IMAGE_URL}${item.icon_url}`} alt="item" />}
          content={item.name}
        />
      ))
    } else {
      return null
    }
  }

  renderCompleted(offer) {
    if (offer.completed) {
      return <span className="Offer__True">true</span>
    } else {
      return <span className="Offer__False">false</span>
    }
  }

  renderFailed(offer) {
    if (!offer.failed) {
      return <span className="Offer__False">false</span>
    }
    return (
      <Popup
        inverted
        content={failureReasons[offer.failureReason] ? failureReasons[offer.failureReason] : 'Unknown'}
        trigger={
          <span className="Offer__True">true</span>
        }
      />
    )
  }

  renderResend(offer) {
    if (this.props.offers.resending) {
      return <Table.Cell disabled></Table.Cell>
    }

    if (!offer.completed && offer.failed) {
      return (
        <Table.Cell collapsing textAlign='center'>
          <a className="Admin__Offer-Resend" onClick={() => this.props.resendOffer(offer)}>
            Resend
          </a>
        </Table.Cell>
      )
    }
    return (
      <Table.Cell disabled></Table.Cell>
    )
  }

  renderTradeOffer(offer, index) {
    const userItems = this.renderItems(offer.userItems)
    const botItems = this.renderItems(offer.botItems)
    const date = moment(new Date(offer.created)).fromNow()

    return (
      <Table.Row key={index}>
        <Table.Cell collapsing textAlign='center'>
          {offer.roundId ? offer.roundId : offer.gameId}
        </Table.Cell>
        <Table.Cell collapsing textAlign='center' style={{ fontSize: '10px' }}>
          <a href={`https://steamcommunity.com/profiles/${offer.userId}`} target="_blank">{offer.userId}</a>
        </Table.Cell>
        <Table.Cell collapsing textAlign='center' style={{ fontSize: '10px' }}>
          <a href={`https://steamcommunity.com/profiles/${offer.botId}`} target="_blank">{offer.botId}</a>
        </Table.Cell>
        <Table.Cell>
          { userItems }
        </Table.Cell>
        <Table.Cell>
          { botItems }
        </Table.Cell>
        <Table.Cell collapsing textAlign='center'>{date}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>{this.renderCompleted(offer)}</Table.Cell>
        <Table.Cell collapsing textAlign='center'>{this.renderFailed(offer)}</Table.Cell>
        { this.renderResend(offer) }
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

    return selection.map((offer, index) => this.renderTradeOffer(offer, index))
  }

  render() {
    if (this.props.offers.loading) {
      return <div className="ui active centered huge inline loader"></div>
    }

    return (
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Game ID</Table.HeaderCell>
            <Table.HeaderCell>User</Table.HeaderCell>
            <Table.HeaderCell>Bot</Table.HeaderCell>
            <Table.HeaderCell>User Items</Table.HeaderCell>
            <Table.HeaderCell>Bot Items</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
            <Table.HeaderCell>Completed</Table.HeaderCell>
            <Table.HeaderCell>Failed</Table.HeaderCell>
            <Table.HeaderCell>Resend</Table.HeaderCell>
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
