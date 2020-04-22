import mongoose, { Schema } from 'mongoose'
import { User } from '../'

var messageSchema = new Schema({
  senderId: {type: String, required: true},
  message: {type: String, required: true},
  date: {type: Date, default: Date.now, required: true}
});

messageSchema.statics.loadRecentMessages = function(limit) {
  return this.find({}).sort('-date').limit(limit).exec()
}

messageSchema.statics.formatMessages = function(messages) {
  let i, promises = []

  for (i = 0; i < messages.length; i++) {
    promises.push(messages[i].formatMessage())
  }

  return Promise.all(promises)
}

messageSchema.methods.formatMessage = function() {
  return new Promise((resolve, reject) => {
    User.findById(this.senderId).exec()
      .then(user => {
        resolve({
          id: this._id,
          user: user,
          message: this.message
        })
      })
      .catch(err => {
        reject(err)
      })
  })
}

const Message = mongoose.model('Message', messageSchema)

export default Message
