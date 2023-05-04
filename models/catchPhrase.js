const { Schema, model } = require('mongoose');


const catchPhraseSchema = new Schema({
  catchPhrase: { type: String, required: true },
}, { timestamps: true });

module.exports = model('User', userSchema);
