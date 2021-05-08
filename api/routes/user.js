const router = require('express').Router(),
    { User } = require('../models/user'),
    { Review } = require('../models/review'),
    bcrypt = require('bcrypt'),
    { middleware: roleAuth } = require('../middlewares/allowrole');

router.post('/', roleAuth(['admin']), async (req, res) => {
    const { email, pass } = req.body; // need to add better way to add user
    const user = new User({
        email,
        hpass: await bcrypt.hash(pass, 10)
    })
    try {
        await user.save()
    } catch (err) {
        console.log(err);
        if (err.code === 1000) {
            return res.status(409).json({
                msg: 'email already in use'
            })
        }
    }
    res.status(201).send({
        msg: `user created with id : ${user._id}`
    })
})

router.get('/list', roleAuth(['admin']), async (req, res) => {
    const ids = (await User.find({}, '_id').lean()).map(user => user._id.toString())
    res.status(200).send({
        ids
    })
})

router.get('/reviewers', async (req, res) => {
    let { user: { _id: id }, user } = req
    if (user.role === 'admin')
        ({ id = id } = req.body);
    const ids = (await Review.find({
        reviewee: id
    }).select({ reviewer: 1, _id: 0 }).lean()).map(revirew => revirew.reviewer._id.toString())
    res.status(200).send({
        ids
    })
})

router.get('/', async (req, res) => {
    let { user: { _id: id }, user } = req
    if (user.role === 'admin')
        ({ id = id } = req.body);
    res.status(200).json({
        result: await User.findById(id).select({ email: 1, _id: 0 }).lean()
    })
})

module.exports = {
    router
}