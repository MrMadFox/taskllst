const { Task } = require('../models/task'),
    { Review } = require('../models/review');

const middleware = (roles) => async (req, res, next) => {
    const { id: taskId } = { ...req.body, ...req.params }
    const { user } = req
    const { createdBy } = await Task.findById(taskId).select({ createdBy: 1, _id: 0 })
    if (!createdBy)
        return res.status(404).json({
            msg: 'not found'
        })

    if (!((roles.includes('admins') && user.role === 'admin') ||
        (roles.includes('creator') && createdBy.toString() === user._id.toString()) ||
        (roles.includes('reviewers') && await Review.findOne({ reviewee: createdBy.toString(), reviewer: user._id.toString() }))))
        return res.status(401).send({
            msg: `not authorised to taskId: ${taskId}`
        })

    next()
}

module.exports = {
    middleware
}