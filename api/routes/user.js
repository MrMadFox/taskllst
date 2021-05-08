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
    res.status(200).send({
        result: await User.find({}).select({ _id: 0, hpass: 0, __v: 0 }).lean()
    })
})


router.get('/email/:email', roleAuth(['admin']), async (req, res) => {
    const { email } = req.params
    res.status(200).json({
        result: await User.findOne({ email }).select({ _id: 0, hpass: 0, __v: 0 }).lean()
    })
})


router.get('/', async (req, res) => {
    let { user } = req
    res.status(200).json({
        result: {
            email: user.email,
            role: user.role
        }
    })
})


getReviewersIds = async (user) => {
    const reviews = await Review.find({
        reviewee: user._id
    }).select({ reviewer: 1, _id: 0 }).lean()
    return reviews.map(revirew => revirew.reviewer._id.toString())
}

getRevieweeIds = async (user) => {
    const reviews = await Review.find({
        reviewer: user._id
    }).select({ reviewee: 1, _id: 0 }).lean()
    return reviews.map(revirew => revirew.reviewer._id.toString())
}


router.get('/reviewers', async (req, res) => {
    const { user } = req
    const ids = getReviewersIds(user)
    res.status(200).send({
        ids
    })
})

router.get('/reviewers/email/:email', roleAuth(['admin']), async (req, res) => {
    const { email } = req.params
    const userTmp = await User.findOne({ email }).select({ _id: 1 }).lean()
    if (!userTmp)
        return res.status(400).send({
            msg: 'user not found'
        })
    const ids = await getReviewersIds(userTmp)
    res.status(200).send({
        ids
    })
})

router.get('/reviewees', async (req, res) => {
    const { user } = req
    const ids = getRevieweeIds(user)
    res.status(200).send({
        ids
    })
})

router.get('/reviewees/email/:email', roleAuth(['admin']), async (req, res) => {
    const { email } = req.params
    const userTmp = await User.findOne({ email }).select({ _id: 1 }).lean()
    if (!userTmp)
        return res.status(400).send({
            msg: 'user not found'
        })
    const ids = await getRevieweeIds(userTmp)
    res.status(200).send({
        ids
    })
})

module.exports = {
    router
}