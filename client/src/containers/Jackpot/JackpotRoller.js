import React, { Component } from 'react'
import { TimelineMax, Power4 } from 'gsap'
import { getDepositChance } from '../../util/jackpot'

const TILE_COUNT = 100
const MIN_INDEX = 6, MAX_INDEX = 6

export default class JackpotRoller extends Component {

  constructor(props) {
    super(props)

    this.findWinnerX = this.findWinnerX.bind(this)
  }

  componentDidMount() {
    if (this.props.round) {
      const tl = new TimelineMax({
        onComplete: this.props.onComplete,
      })

      const winnerX = this.findWinnerX()

      tl.to(this.refs.roller, 10, { x: -winnerX, ease: Power4.easeOut })
    }
  }

  getArrayOfUsers() {
    const users = []
    const { round } = this.props
    for (const index in round.deposits) {
      const deposit = round.deposits[index]
      const chance = getDepositChance(round, deposit)
      const totalTiles = parseInt(Math.round(TILE_COUNT * chance))

      for (let i = 0; i < totalTiles; i++) {
        users.push({
          id: deposit.id,
          image: deposit.image
        })
      }
    }
    let array
    let isGood
    while (!isGood) {
      array = this.shuffle(users)
      isGood = this.checkWinnerLocation(array)
    }
    return array
  }

  checkWinnerLocation(array) {
    const { winner } = this.props.round
    for (let i = array.length - 1 - MAX_INDEX; i >= MIN_INDEX; i--) {
      const tile = array[i]
      if (tile.id === winner.id) {
        return true
      }
    }
    return false
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  getImages() {
    if (!this.userArray) {
      this.userArray = this.getArrayOfUsers()
    }
    return this.userArray.map((tile, key) => (
      <div className="Tile">
        <img src={tile.image} alt="tile" />
      </div>
    ))
  }

  findWinnerX() { //ABOVE INDEX 6 AND BELOW LENGTH - 6
    const { winner } = this.props.round

    let winnerIndex = this.userArray.length - 1

    for (let i = this.userArray.length - 1 - MAX_INDEX; i >= MIN_INDEX; i--) {
      const tile = this.userArray[i]
      if (tile.id === winner.id) {
        winnerIndex = i
        break
      }
    }

    const closestToEdge = 3
    const rangeLow = closestToEdge
    const rangeHigh = (80 - closestToEdge)

    return ((winnerIndex) * (80 + 2 + 2)) + this.getRandomInt(rangeLow, rangeHigh)
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  render() {
    return (
      <div className="JackpotRoller__Wrapper">
        <div className="JackpotRoller" ref="roller">
          {this.props.round &&
             this.getImages()
          }
        </div>
        <div className="Indicator"></div>
      </div>
    )
  }
}
