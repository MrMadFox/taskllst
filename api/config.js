const nconf = require('nconf')

nconf.file({ file: './config.json' })
    .env();
