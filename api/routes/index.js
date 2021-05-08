const router = require('express').Router(),
    { router: healthRouter } = require('./health'),
    { router: taskRouter } = require('./task'),
    { router: userRouter } = require('./user'),
    { router: authRouter } = require('./auth'),
    { router: reviewRouter } = require('./review'),
    { middleware: authenticateMiddleware } = require('../middlewares/authenticate');

router.use('/health', healthRouter)
router.use('/auth', authRouter)
router.use('/task', authenticateMiddleware, taskRouter)
router.use('/user', authenticateMiddleware, userRouter)
router.use('/review', authenticateMiddleware, reviewRouter)

module.exports = {
    router
}