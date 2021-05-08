const mongoose = require('mongoose');

const Task = mongoose.model('tasks',
    mongoose.Schema({
        discription: { type: String, default: 'No discrption' },
        createdBy: { type: mongoose.Schema.ObjectId, required: true },
        status: { type: String, default: 'created' },
        approvedBy: [{ type: mongoose.Schema.ObjectId }],
        title: { type: String, required: true },
    }));

module.exports = {
    Task
}