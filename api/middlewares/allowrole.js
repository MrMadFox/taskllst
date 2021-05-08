const middleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(401).json({
            msg: 'not authorised to perform this action'
        })
    next()
}

module.exports = {
    middleware
}