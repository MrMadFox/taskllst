const mongoose = require('mongoose');

const schema = mongoose.Schema({
    reviewee: { type: mongoose.Schema.ObjectId, required: true },
    reviewer: { type: mongoose.Schema.ObjectId, required: true },
})
schema.index({ reviewee: 1, reviewer: 1 }, { unique: true, dropDups: true })

const Review = mongoose.model('reviews', schema)

module.exports = {
    Review
}