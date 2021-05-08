const express = require('express')
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    { router } = require('./routes'),
    cookieParser = require('cookie-parser'),
    audit = require('express-requests-logger')
    cors = require('cors');

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cors())

app.use(audit({
    logger: console.log,
    excludeURLs: ['health'],
    request: {
        maskBody: ['pass'],
        excludeHeaders: [],
        excludeBody: ['token'],
        maskHeaders: [],
        maxBodyLength: 50
    },
    response: {
        maskBody: ['token'],
        excludeHeaders: [],
        excludeBody: [],
        maskHeaders: [],
        maxBodyLength: 50
    }
}));

app.use('/api', router)

module.exports = {
    app
}

// update status of ticket