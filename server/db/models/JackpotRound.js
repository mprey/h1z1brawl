import mongoose, { Schema } from 'mongoose'
import { User } from '../'
import autoIncrement from 'mongoose-auto-increment'
import { getJackpotTotal, findWinningDeposit } from '../../util/jackpot'
import md5 from 'md5'
import { generateSecret, generatePercentage } from '../../util/random'

var jackpotRoundSchema = new Schema({
  currentRound: { type: Boolean, default: false },
  deposits: [{
    id: String,
    name: String,
    image: String,
    items: [{
      assetid: String,
      icon_url: String,
      price: Number,
      name: String
    }]
  }],
  winner: {
    id: String,
    name: String,
    image: String
  },
  hash: { type: String },
  winningPercentage: { type: Number },
  secret: { type: String },
  completed: { type: Boolean, default: false },
  timerStart: { type: Date },
  dateCreated: { type: Date, default: Date.now },
  dateCompleted: { type: Date }
})

jackpotRoundSchema.methods.setTimerStarted = function() {
  this.timerStart = new Date()
  return this.save()
}

jackpotRoundSchema.methods.toCleanObject = function() {
  const object = this.toObject()
  delete object.winningPercentage
  delete object.secret
  return object
}

jackpotRoundSchema.methods.calculateWinner = function() {
  return new Promise((resolve, reject) => {
    /* set the currentRound to false and completed to true since the game is now technically over */
    this.currentRound = false
    this.completed = true

    /* find the total amount the jackpot was */
    const total = getJackpotTotal(this.toObject())

    /* total number of tickets is the number of cents (e.g. $32.43 jackpot is 3243 tickets) */
    const numTickets = total * 100

    /* find the location of the winning ticket calculated by the winning percentage */
    const winningTicket = parseInt(numTickets * (this.winningPercentage / 100))

    /* find the location of the winning deposit by the winning ticket */
    const winningDeposit = findWinningDeposit(this.toObject(), winningTicket)

    this.winner = {
      id: winningDeposit.id,
      name: winningDeposit.name,
      image: winningDeposit.image
    }

    User.addTotalWon(winningDeposit.id, total)

    this.save().then(resolve).catch(reject)
  })
}

jackpotRoundSchema.methods.addDeposit = function(jackpotOffer) {
  return new Promise((resolve, reject) => {
    if (hasDeposit(this.toObject(), jackpotOffer)) {
      return reject(new Error('Already deposited -- ignore this error'))
    }
    
    User.findById(jackpotOffer.userId).exec().then(user => {
      this.deposits.push({
        depositId: jackpotOffer._id,
        id: user._id,
        name: user.name,
        image: user.image,
        items: jackpotOffer.userItems
      })
      return this.save()
    }).then(resolve).catch(reject)
  })
}

jackpotRoundSchema.statics.getRecentRounds = function(limit) {
  return this.find({ currentRound: false }).sort({ dateCompleted: -1} ).limit(limit).exec()
}

jackpotRoundSchema.statics.getTotalWonInDays = function(days) {
  return new Promise((resolve, reject) => {
    const target = new Date()
    target.setDate(target.getDate() - days)
    this.find({
      dateCompleted: { $lt: new Date(), $gt: target }
    }).exec().then(games => {
      let total = 0.00
      for (const index in games) {
        const game = games[index]
        const gameTotal = getJackpotTotal(game.toObject())
        total += gameTotal
      }
      resolve(total)
    }).catch(reject)
  })
}

jackpotRoundSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed) {
    this.dateCompleted = new Date()
  }
  if (!this.hash) {
    this.secret = generateSecret()
    this.winningPercentage = generatePercentage()
    this.hash = md5(`${this.secret}-${this.winningPercentage}`)
  }
  next()
})

function hasDeposit(instance, jackpotOffer) {
  for (const index in instance.deposits) {
    const deposit = instance.deposits[index]
    if (deposit.depositId === jackpotOffer._id) {
      return true
    }
  }
  return false
}

autoIncrement.initialize(mongoose.connection) //make sure it is initialized before creating plugin

jackpotRoundSchema.plugin(autoIncrement.plugin, {
  model: 'JackpotRound',
  startAt: 1
})

const JackpotRound = mongoose.model('JackpotRound', jackpotRoundSchema)

export default JackpotRound
