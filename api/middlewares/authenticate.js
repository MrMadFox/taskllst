const nconf = require('nconf'),
    jwt = require('jsonwebtoken'),
    { User } = require('../models/user');

const middleware = async (req, res, next) => {
    const { token } = req.cookies
    try {
        const { id } = await jwt.verify(token, nconf.get('JWT_SECRET'))
        const user = await User.findById(id).lean()
        if (!user)
            return res.status(400).json({ msg: 'user not fount' })
        req.user = user
        next()
    } catch (err) {
        console.log(err)
        res.status(400).json({ err, msg: 'relogin' })
    }
}

module.exports = {
    middleware
}