require('./config')
const nconf = require('nconf'),
    { User } = require('./models/user'),
    bcrypt = require('bcrypt'),
    { app } = require('./server');

//remove this 
; (async _ => {
    await new Promise((resolve) => {
        let resolved = false;
        mongoose.connect(`mongodb://${nconf.get('DB:HOST')}:${nconf.get('DB:PORT')}/${nconf.get('DB:NAME')}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: true,
            useCreateIndex: true
        });
        mongoose.connection.on('error', (error) => {
            console.log('Error in MongoDb connection: ' + error);
            mongoose.disconnect()
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected!')
            mongoose.connect(`mongodb://${nconf.get('DB:HOST')}:${nconf.get('DB:PORT')}/${nconf.get('DB:NAME')}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false,
                useCreateIndex: true
            })
        });
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected!')
            if (!resolved) {
                resolved = true
                resolve()
            }
        })
    })
    const users = [
        {
            email: 'c.saipraneeth888@gmail.com',
            pass: 'admin',
            role: 'admin'
        }, {
            email: 'user1@gmail.com',
            pass: 'user1',
            role: 'user'
        }, {
            email: 'user2@gmail.com',
            pass: 'user2',
            role: 'user'
        }
    ];
    for (user of users) {
        try {
            await new User({
                email: user.email,
                role: user.role,
                hpass: await bcrypt.hash(user.pass, 10)
            }).save()
        } catch (err) { }
    }

    const PORT = nconf.get('PORT')
    app.listen(PORT, () => {
        console.log(`started server on ${PORT}`)
    })
})()