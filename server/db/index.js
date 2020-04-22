import { Promise as bluebird } from 'bluebird'
import config from '../../config'
import redis from 'redis'

bluebird.promisifyAll(redis.RedisClient.prototype)

const client = redis.createClient(config.database.redis)

export const connect = (mongoose) => {
  mongoose.Promise = global.Promise //native es6 library

  mongoose.connect(config.database.uri, (err) => {
    if (err) {
      console.log('Error while connecting to MongoDB: ', err)
      process.exit(0)
    }
    console.log('Connected to MongoDB')
  })

  client.on('connect', () => {
    console.log('Connected to Redis')
  })
}

export { client }

export User from './models/User'
export RakeItem from './models/RakeItem'
export Price from './models/Price'
export Message from './models/Message'
export Coinflip from './models/Coinflip'
export CoinflipOffer from './models/CoinflipOffer'
export JackpotRound from './models/JackpotRound'
export JackpotOffer from './models/JackpotOffer'
