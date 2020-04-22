import mongoose, { Schema } from 'mongoose'
import { User } from '../'
import autoIncrement from 'mongoose-auto-increment'
import { getCoinflipTotal } from '../../util/coinflip'
import md5 from 'md5'
import { generateSecret, generatePercentage } from '../../util/random'

var coinflipSchema = new Schema({
  creator: {
    id: String,
    name: String,
    image: String,
    items: [{
      assetid: String,
      icon_url: String,
      price: Number,
      name: String
    }]
  },
  joiner: {
    id: String,
    name: String,
    image: String,
    items: [{
      assetid: String,
      icon_url: String,
      price: Number,
      name: String
    }]
  },
  timeout: { type: Boolean, required: true, default: false },
  startingSide: { type: String, required: true },
  hash: { type: String },
  winningPercentage: { type: Number },
  secret: { type: String },
  open: { type: Boolean, default: false },
  failed: { type: Boolean, default: false },
  winnerId: { type: String },
  completed: { type: Boolean, default: false },
  dateJoined: { type: Date },
  dateCreated: { type: Date, default: Date.now },
  dateCompleted: { type: Date }
})

coinflipSchema.methods.setFailed = function() {
  this.failed = true
  this.open = false
  return this.save()
}

coinflipSchema.methods.setOpen = function() {
  this.open = true
  return this.save()
}

coinflipSchema.methods.setJoiner = function(user, items) {
  this.joiner = {
    id: user._id,
    name: user.name,
    image: user.image,
    items
  }
  this.dateJoined = new Date()
  return this.save()
}

coinflipSchema.methods.removeJoiner = function() {
  this.joiner = {
    items: []
  }
  this.dateJoined = null
  return this.save()
}

coinflipSchema.methods.setCompleted = function() {
  this.completed = true
  return this.save()
}

coinflipSchema.methods.toCleanObject = function() {
  const object = this.toObject()
  delete object.winningPercentage
  delete object.secret
  return object
}

coinflipSchema.statics.findByCoinflipOffer = function({ gameId }) {
  if (!gameId) {
    return null
  }
  return this.findOne({ _id: gameId }).exec()
}

coinflipSchema.statics.getRecentlyClosedGames = function() {
  const target = new Date()
  target.setMinutes(target.getMinutes() - 3000)
  return this.find({ completed: true, failed: false, dateCompleted: { $lt: new Date(), $gt: target } }).exec()
}

coinflipSchema.statics.getUserHistory = function(userId, limit) {
  return this.find({ completed: true, failed: false }).or([{ creatorId: userId }, { joinerId: userId }]).sort({ dateCompleted: -1 }).limit(limit).exec()
}

coinflipSchema.statics.getRecentGames = function(limit) {
  return this.find({ completed: true, failed: false }).sort({ dateCompleted: -1} ).limit(limit).exec()
}

coinflipSchema.statics.getOpenGames = function() {
  return this.find({ open: true, failed: false }, { secret: 0, winningPercentage: 0 }).exec()
}

coinflipSchema.statics.getTotalWonInDays = function(days) {
  return new Promise((resolve, reject) => {
    const target = new Date()
    target.setDate(target.getDate() - days)
    this.find({
      dateCompleted: { $lt: new Date(), $gt: target }
    }).exec().then(games => {
      let total = 0.00
      for (const index in games) {
        const game = games[index]
        total += parseFloat(getCoinflipTotal(game))
      }
      resolve(total)
    }).catch(reject)
  })
}

coinflipSchema.pre('save', function(next) {
  if (this.isModified('completed') && this.completed) {
    this.dateCompleted = new Date()
    this.open = false
  }
  if (!this.hash) {
    this.secret = generateSecret()
    this.winningPercentage = generatePercentage()
    this.hash = md5(`${this.secret}-${this.winningPercentage}`)
  }
  next()
})

autoIncrement.initialize(mongoose.connection) //make sure it is initialized before creating plugin

coinflipSchema.plugin(autoIncrement.plugin, 'Coinflip')

const Coinflip = mongoose.model('Coinflip', coinflipSchema)

export default Coinflip
