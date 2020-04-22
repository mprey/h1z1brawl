import mongoose, { Schema } from 'mongoose'

const rakeItemSchema = new Schema({
  assetid: { type: String, required: true },
  icon_url: { type: String, required: true },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  dateAdded: { type: Date, default: Date.now},
  dateWithdrawn: { type: Date, required: false },
  withdrawn: { type: Boolean, required: true, default: false },
  botId: { type: String, required: true }
})

rakeItemSchema.methods.setWithdrawn = function() {
  this.withdrawn = true
  this.dateWithdrawn = new Date()
  return this.save()
}

rakeItemSchema.statics.getAllRake = function() {
  return this.find({}).exec()
}

rakeItemSchema.statics.getAllUnclaimedRake = function() {
  return this.find({ withdrawn: false }).exec()
}

rakeItemSchema.statics.addRake = function(botId, rake) {
  if (!rake || rake.length === 0) {
    return
  }

  const items = []
  for (const index in rake) {
    const rakeItem = rake[index]
    items.push(new RakeItem({
      assetid: rakeItem.assetid,
      icon_url: rakeItem.icon_url,
      price: rakeItem.price,
      name: rakeItem.name,
      botId
    }))
  }
  this.insertMany(items, (err, docs) => {
    if (err) {
      console.log('>> Error inserting rake items: ' + err.message)
    } else {
      console.log(`>> Inserted ${docs.length} items as rake.`)
    }
  })
}

const RakeItem = mongoose.model('RakeItem', rakeItemSchema)

export default RakeItem
