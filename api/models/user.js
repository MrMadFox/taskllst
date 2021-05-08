const mongoose = require('mongoose');

const User = mongoose.model('users',
    mongoose.Schema({
        role: { type: String, default: 'user' },
        hpass: { type: String },
        email: { type: String, unique: true },
    }));

module.exports = {
    User
}