import mongoose, { Schema } from 'mongoose'

var priceSchema = new Schema({
  name: String,
  price: Number
});

priceSchema.statics.updatePrice = function(name, price) {
  this.update({ name }, { $set: { price } }, { upsert: true }).exec()
    .catch(err => {
      console.log(`Error while updating ${name}: ${err.message}`)
    })
}

priceSchema.statics.formatPrice = function(item) {
  return new Promise((resolve, reject) => {
    this.findOne({ name: item.name }).exec()
      .then(object => {
        resolve({
          name: item.name,
          assetid: item.assetid,
          icon_url: item.icon_url,
          price: object.price ? Number(object.price).toFixed(2) : 0.00
        })
      })
      .catch(err => reject(err))
  })
}

priceSchema.statics.formatPrices = function(items) {
  let i, promises = []

  for (i = 0; i < items.length; i++) {
    promises.push(Price.formatPrice(items[i]))
  }

  return Promise.all(promises)
}

const Price = mongoose.model('Price', priceSchema)

export default Price
