const router = require('express').Router(),
    nconf = require('nconf'),
    { User } = require('../models/user'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const { email, pass } = req.body;
    const user = await User.findOne({ email }).lean()
    if (!(user && await bcrypt.compare(pass, user.hpass)))
        return res.status(401).json({
            msg: 'check email and password'
        })
    const token = jwt.sign({ id: user._id.toString(), user }, nconf.get('JWT_SECRET'), { expiresIn: '1h' });
    res.cookie('token', token)
    res.status(200).json({ token })
})

router.post('/logout', async (req, res) => {
    res.cookie('token', '')
    res.status(200).json({
        msg: 'logged out'
    })
})

module.exports = {
    router
}