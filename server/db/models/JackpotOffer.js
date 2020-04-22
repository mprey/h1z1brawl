import mongoose, { Schema } from 'mongoose'

var jackpotOfferSchema = new Schema({
  _id: { type: String },
  userId: { type: String, required: true },
  botId: { type: String, required: true },
  tradeUrl: { type: String, required: true },
  roundId: { type: String },
  tradeId: { type: String },
  type: {type: Number, required: true, default: 0 },
  userItems: [{
    assetid: String,
    icon_url: String,
    price: Number,
    name: String
  }],
  botItems: [{
    assetid: String,
    icon_url: String,
    price: Number,
    name: String
  }],
  created: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  failed: { type: Boolean, default: false },
  failureReason: { type: String }
})

jackpotOfferSchema.methods.setRoundId = function(id) {
  this.roundId = id
  return this.save()
}

jackpotOfferSchema.methods.setAccepted = function() {
  this.completed = true
  return this.save()
}

jackpotOfferSchema.methods.setFailed = function(reason) {
  this.failed = true
  this.failureReason = `${reason}`
  return this.save()
}

jackpotOfferSchema.methods.setTradeId = function(id) {
  this.tradeId = id
  this.save()
}

jackpotOfferSchema.statics.findUserOffers = function(id, limit) {
  return new Promise((resolve, reject) => {
    this.find({ userId: id }).limit(limit).sort({ created: -1 }).exec().then(resolve).catch(reject)
  })
}

jackpotOfferSchema.statics.getAllOffers = function() {
  return this.find({ $where: "this.botItems.length > 0" }).exec()
}

jackpotOfferSchema.statics.findByRound = function({ _id }) {
  return this.findOne({ roundId: _id }).exec()
}


jackpotOfferSchema.statics.findByTradeOffer = function({ tradeId }) {
  if (!tradeId) {
    return null
  }
  return this.findOne({ _id: tradeId }).exec()
}

const JackpotOffer = mongoose.model('JackpotOffer', jackpotOfferSchema)

export default JackpotOffer
