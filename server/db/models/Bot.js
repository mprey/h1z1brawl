import mongoose, { Schema } from 'mongoose'

var botSchema = new Schema({
    accountName: { type: String, required: true },
    password: { type: String, required: true },
    sharedSecret: { type: String, required: true },
    identitySecret: { type: String, required: true },
});

botSchema.statics.getBots = function(callback, error) {
    return this.find({}).exec().then(bots => bots.forEach(bot => callback(bot.toObject()))).catch(error);
}

const Bot = mongoose.model('Bot', botSchema)

export default Bot