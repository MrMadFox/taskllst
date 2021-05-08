const router = require('express').Router(),
    { Review } = require('../models/review'),
    { User } = require('../models/user'),
    { middleware: roleAuth } = require('../middlewares/allowrole');

router.post('/', roleAuth(['admin']), async (req, res) => {
    const { reviewee, reviewer } = req.body;
    const [reviewerObj, revieweeObj] = await Promise.all([User.findOne({ email: reviewer }), User.findOne({ email: reviewee })])
    if (!reviewerObj || !revieweeObj)
        return res.status(404).json({
            msg: 'check emails'
        })
    await new Review({
        reviewer: reviewerObj._id,
        reviewee: revieweeObj._id
    }).save()
    res.status(201).json({
        msg: 'added'
    })
})

router.delete('/', roleAuth(['admin']), async (req, res) => {
    const { reviewee, reviewer } = req.body;
    const [reviewerObj, revieweeObj] = await Promise.all([User.findOne({ email: reviewer }), User.findOne({ email: reviewee })])
    if (!reviewerObj || !revieweeObj)
        return res.status(404).json({
            msg: 'check emails'
        })
    try {
        const review = await Review.findOneAndRemove({
            reviewer: reviewerObj._id,
            reviewee: revieweeObj._id
        });
        if (!review)
            return res.status(404).json({
                msg: 'pair not found'
            })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: 'something went wrong'
        })
    }
    res.status(201).json({
        msg: 'deleted'
    })
})

module.exports = {
    router
}