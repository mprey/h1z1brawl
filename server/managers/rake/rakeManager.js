import config from '../../../config'
import { RakeItem, User } from '../../db'
import { bot as botManager } from '../'

class RakeManager {

    startRakeInterval() {
        setInterval(() => {
            console.log(`>> Exporting rake to account ID: ${config.rake.rakeAccount}`)
            User.findById(config.rake.rakeAccount)
                .then(user => this.withdrawAllRake(user))
                .then(() => {
                    console.log(`>> Successfully exported rake to user: ${config.rake.rakeAccount}`)
                }).catch(err => {
                    console.log(`>> Error exporting rake: ${err}`)
                });
        }, config.rake.automatedRakeTime)
    }

    withdrawRake(user, rakeItem) {
        return new Promise((resolve, reject) => {
            RakeItem.findById(rakeItem._id).then(item => {
                const bot = botManager.getBot(item.botId)
                if (!bot || !bot.enabled) {
                  reject(new Error('Bot with the items is currently offline. Consult a developer.'));
                }
                bot.sendRakeRequest(user, rakeItem).then(() => {
                  item.setWithdrawn()
                  resolve()
                }).catch(reject)
            }).catch(reject)
        });
    }

    withdrawAllRake(user) {
        return new Promise((resolve, reject) => {
            RakeItem.getAllUnclaimedRake().then(rakeData => {
                const botRequests = {}
                for (const index in rakeData) {
                  const rakeItem = rakeData[index]
                  if (botRequests[rakeItem.botId]) {
                    botRequests[rakeItem.botId].items.push(rakeItem.toObject())
                    rakeItem.setWithdrawn()
                  } else {
                    const bot = botManager.getBot(rakeItem.botId)
                    if (bot && bot.enabled) {
                      botRequests[bot.getSteamID64()] = { bot: bot, items: [rakeItem] }
                    }
                  }
                }
                for (const botIndex in botRequests) {
                  const { bot, items } = botRequests[botIndex]
                  bot.sendRakesRequest(user, items)
                }
                resolve()
            }).catch(reject)
        });
    }

}

export { RakeManager }