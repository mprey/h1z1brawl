import { client, Price } from '../db'
import config from '../../config'
import { Promise as bluebird } from 'bluebird'
import SteamCommunity from 'steamcommunity'

bluebird.promisifyAll(SteamCommunity.prototype)

const APP_ID = 433850
const community = new SteamCommunity()

export function loadInventory(userId) {
  const endpoint = `${userId}/${config.inventory.endpoints.default}`
  return new Promise((resolve, reject) => {
    client.getAsync(endpoint)
      .then(data => {
        if (data) {
          return resolve(JSON.parse(data))
        }
        return queryInventory(userId)
          .then(inventory => {
            client.set(endpoint, JSON.stringify(inventory), 'EX', config.inventory.cacheTimeout);
            resolve(inventory)
          })
          .catch(reject)
      })
      .catch(reject)
  })
}

export function queryInventory(userId) {
  return new Promise((resolve, reject) => {
    community.getUserInventoryContentsAsync(userId, APP_ID, 1, true)
      .then(Price.formatPrices)
      .then(resolve)
      .catch(reject)
  })
}

export function forceRefreshInventory(userId) {
  const forceEndpoint = `${userId}/${config.inventory.endpoints.forceReload}`
  const userEndpoint = `${userId}/${config.inventory.endpoints.default}`
  return new Promise((resolve, reject) => {
    client.getAsync(forceEndpoint)
      .then(data => {
        if (!data) {
          client.set(forceEndpoint, 'XDRawr', 'EX', config.inventory.reloadCooldown)
          return queryInventory(userId)
            .then(inventory => {
              client.set(userEndpoint, JSON.stringify(inventory), 'EX', config.inventory.cacheTimeout);
              resolve(inventory)
            })
            .catch(reject)
        }
        client.ttlAsync(forceEndpoint).then(ttl => {
          return reject({
            ttl: `You must wait ${formatSeconds(ttl)} before reloading your inventory`
          })
        })
      })
      .catch(reject)
  })
}

function formatSeconds(time) {
  var minutes = Math.floor(time / 60);
  var seconds = time - minutes * 60;
  return (minutes > 1 ? minutes + ' minutes ' : (minutes == 1 ? '1 minute ' : '')) + '' + (seconds > 1 ? seconds + ' seconds' : (seconds == 1 ? '1 second' : ''));
}
