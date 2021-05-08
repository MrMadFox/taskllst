const router = require('express').Router(),
    nconf = require('nconf');

router.get('/', (req, res) => {
    const { secret } = req.body
    if (secret !== nconf.get('HEALTH_SECRET'))
        return res.status(401).json({
            msg: 'Not authorised'
        })
    res.status(200).json({
        msg: 'good'
    })
})

module.exports = {
    router
}