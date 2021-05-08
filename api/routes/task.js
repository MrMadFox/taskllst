const router = require('express').Router(),
    { Task } = require('../models/task'),
    { Review } = require('../models/review'),
    { User } = require('../models/user'),
    { middleware: authTask } = require('../middlewares/authtask');

router.get('/id/:id', authTask(['admins', 'creator', 'reviewers']), async (req, res) => {
    const { id } = req.params
    res.status(200).json({
        result: await Task.findById(id).select({ _id: 0, __v: 0 })
    })
})

router.put('/id/:id', authTask(['creator']), async (req, res) => {
    const { id } = req.params
    const { toUpdate } = req.body
    const task = await Task.findById(id)
    for (const [key, value] of Object.entries(toUpdate)) {
        if (['discription', 'title', 'status'].includes(key))
            task[key] = value
    }
    await task.save()
    res.status(204).send({
        msg: 'updated'
    })
})

router.put('/approve/:id', authTask(['reviewers']), async (req, res) => {
    const { user } = req
    const { id } = req.params
    const task = await Task.findById(id)
    if (task.approvedBy.includes(user._id))
        return res.status(409).json({
            msg: 'already approved'
        })
    task.approvedBy.push(user._id)
    await task.save()
    res.status(200).json({
        msg: 'approved'
    })
})

router.put('/refuse/:id', authTask(['reviewers']), async (req, res) => {
    const { user } = req
    const { id } = req.params
    const task = await Task.findById(id)
    const idx = task.approvedBy.indexOf(user._id)
    if (idx === -1)
        return res.status(400).json({
            msg: 'not approved'
        })
    task.approvedBy.$pop(idx);
    await task.save()
    res.status(200).json({
        msg: 'refused sucessfull'
    })
})

router.get('/list', async (req, res) => {
    const { user } = req
    let { query = {} } = req.body // query.createdBy is a email, will be overrided with _id
    if (query.createdBy) {
        const userTmp = await User.findOne({ email: query.createdBy }).select({ _id: 1 }).lean()
        if (!userTmp)
            return res.status(400).json({
                msg: 'no user found'
            })
        if (user.role !== 'admin' && user._id.toString() !== userTmp._id.toString()) { //not admin and not creator
            const review = await Review.findOne({
                reviewee: userTmp._id,
                reviewer: user._id
            })
            if (!review)
                return res.status(401).json({
                    msg: 'not authorised'
                })
        }
        query = { ...query, createdBy: userTmp._id.toString() }
    }
    else if (user.role !== 'admin')
        query = { ...query, createdBy: user._id.toString() }
    const ids = (await Task.find(query, '_id').lean()).map(task => task._id.toString())
    res.status(200).send({
        ids
    })
})

router.post('/', async (req, res) => {
    const { discription, title } = req.body
    const { user } = req
    const task = new Task({
        discription,
        createdBy: user._id,
        title,
    })
    await task.save()
    res.status(201).json({
        msg: `create task with id: ${task._id.toString()}`,
        taskId: task._id.toString()
    })
})


module.exports = {
    router
}