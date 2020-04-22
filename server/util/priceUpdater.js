import { default as request } from 'request-promise-native'
import { Price } from '../db'

const API_ENDPOINT = 'https://opskins.com/pricelist/433850.json'

export default function connect(interval) {
  updatePrices()
  setInterval(updatePrices, interval)
}

function updatePrices() {
  const opts = {
    uri: API_ENDPOINT,
    json: true
  }
  request(opts)
    .then(json => {
      for (const key in json) {
        const price = getItemPrice(json[key])
        Price.updatePrice(key, price)
      }
    })
    .then(xd => {
      console.log('Updated prices')
    })
    .catch(err => {
      console.log(`Error while updating prices: ${err}`)
    })
}

function getItemPrice(object) {
  const lastKey = Object.keys(object).sort().reverse()[0];
  return object[lastKey] ? Number(object[lastKey].price / 100).toFixed(2) : 0.00
}
