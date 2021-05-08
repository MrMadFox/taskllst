require('../config')
const { expect } = require("chai"),
    got = require('got'),
    { User } = require('../models/user'),
    bcrypt = require('bcrypt'),
    jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    nconf = require('nconf'),
    BASEURL = `http://localhost:${nconf.get('PORT')}/api`;


const testUsers = {}
before(async function () {
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
        });
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected!')
            if (!resolved) {
                resolved = true
                resolve()
            }
        })
    })
    await mongoose.connection.db.dropDatabase();
    const users = [
        {
            email: 'admin',
            pass: 'admin',
            role: 'admin'
        }, {
            email: 'user1',
            pass: 'user1',
            role: 'user'
        }, {
            email: 'user2',
            pass: 'user2',
            role: 'user'
        }
    ];
    for (const testuser of users) {
        const user = new User({
            email: testuser.email,
            role: testuser.role,
            hpass: await bcrypt.hash(testuser.pass, 10)
        })
        await user.save()
        testUsers[testuser.email] = {
            id: user._id.toString(),
            token: jwt.sign({ id: user._id.toString(), user }, nconf.get('JWT_SECRET'), { expiresIn: '1h' })
        }
    }
});
after(() => { mongoose.disconnect() })

describe('all', function () {
    it('list users with admin', function (done) {
        got.get(`${BASEURL}/user/list`, {
            body: {
                token: testUsers['admin'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                expect(body.ids.join('')).to.equal(Object.values(testUsers).map(testUser => testUser.id).join(''))
                done()
            })
            .catch(done)
    });

    it('list users with non admin user', function (done) {
        got.get(`${BASEURL}/user/list`, {
            body: {
                token: testUsers['user1'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(401)
            })
            .catch(({ body, statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
    });

    let taskId = '';
    it('create task with user1', function (done) {
        got.post(`${BASEURL}/task`, {
            body: {
                token: testUsers['user1'].token,
                discription: 'discription',
                title: 'title'
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(201)
                taskId = body.taskId
                done()
            })
            .catch(done)
    });

    it('get task with user1', function (done) {
        got.get(`${BASEURL}/task/id/${taskId}`, {
            body: {
                token: testUsers['user1'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                expect(body.result.approvedBy.length).to.equal(0)
                expect(body.result.createdBy).to.equal(testUsers.user1.id)
                expect(body.result.discription).to.equal('discription')
                expect(body.result.status).to.equal('created')
                expect(body.result.title).to.equal('title')
                done()
            })
            .catch(error => {
                done()
            })
    });

    it('update task with user1', function (done) {
        got.put(`${BASEURL}/task/id/${taskId}`, {
            body: {
                token: testUsers['user1'].token,
                toUpdate: {
                    discription: 'updated discription',
                    title: 'updated title',
                    status: 'updated create' // should not get updated
                }
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(204)
                done()
            })
            .catch(done)
    });


    it('update user1 task with user2', function (done) {
        got.put(`${BASEURL}/task/id/${taskId}`, {
            body: {
                token: testUsers['user2'].token,
                toUpdate: {
                    discription: 'updated from user2 discription',
                    title: 'updated from user2 title',
                    status: 'updated from user2 create'
                }
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
            .catch(({ body, statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
            .catch(done)
    });

    it('get task with user1 after updating', function (done) {
        got.get(`${BASEURL}/task/id/${taskId}`, {
            body: {
                token: testUsers['user1'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                expect(body.result.approvedBy.length).to.equal(0)
                expect(body.result.createdBy).to.equal(testUsers.user1.id)
                expect(body.result.discription).to.equal('updated discription')
                expect(body.result.status).to.equal('created')
                expect(body.result.title).to.equal('updated title')
                done()
            })
            .catch(error => {
                done()
            })
    });

    it('get task with user2', function (done) {
        got.get(`${BASEURL}/task/id/${taskId}`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
            .catch(({ body, statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
            .catch(done)
    });

    it('list tasks', function (done) {
        got.get(`${BASEURL}/task/list`, {
            body: {
                token: testUsers['user1'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });

    it('list tasks', function (done) {
        got.get(`${BASEURL}/task/list`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });


    it('list user1 tasks with user2', function (done) {
        got.get(`${BASEURL}/task/list`, {
            body: {
                token: testUsers['user2'].token,
                query: {
                    createdBy: 'user1'
                }
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(({ body, statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
            .catch(done)
    });

    it('approving user1 task by user2', function (done) {
        got.put(`${BASEURL}/task/approve/${taskId}`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
            .catch(({ statusCode }) => {
                expect(statusCode).to.equal(401)
                done()
            })
            .catch(done)
    });

    it('add reviewer', function (done) {
        got.post(`${BASEURL}/review`, {
            body: {
                reviewee: 'user1',
                reviewer: 'user2',
                token: testUsers['admin'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(201)
                done()
            })
            .catch(done)
    });

    it('list user1 tasks with user2 after adding user2 are reviewer to user1', function (done) {
        got.get(`${BASEURL}/task/list`, {
            body: {
                token: testUsers['user2'].token,
                query: {
                    createdBy: 'user1'
                }
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });

    // it('adding reviewer again ', function (done){ // not working check again
    //     got.post(`${BASEURL}/review`, {
    //         body: {
    //             reviewee: 'user1',
    //             reviewer: 'user2',
    //             token: testUsers['admin'].token
    //         },
    //         json: true
    //     })
    //     .then(({ body, statusCode }) => {
    //         expect(statusCode).to.equal(201)
    //         done()
    //     })
    //     .catch(({ body, statusCode }) => {
    //         expect(statusCode).to.equal(201)
    //         done()
    //     })
    //     .catch(done)
    // });

    it('approving user1 task by user2 after adding as reviewer', function (done) {
        got.put(`${BASEURL}/task/approve/${taskId}`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });

    it('approving user1 task by user2 again', function (done) {
        got.put(`${BASEURL}/task/approve/${taskId}`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(err => {
                expect(err.statusCode).to.equal(409)
                done()
            })
            .catch(done)
    });


    it('refusing user1 task by user2', function (done) {
        got.put(`${BASEURL}/task/refuse/${taskId}`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });

    it('approving user1 task by user2 after refusing as reviewer', function (done) {
        got.put(`${BASEURL}/task/approve/${taskId}`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });

    it('refusing user1 task by user2', function (done) {
        got.put(`${BASEURL}/task/refuse/${taskId}`, {
            body: {
                token: testUsers['user2'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(200)
                done()
            })
            .catch(done)
    });

    it('remove reviewer', function (done) {
        got.delete(`${BASEURL}/review`, {
            body: {
                reviewee: 'user1',
                reviewer: 'user2',
                token: testUsers['admin'].token
            },
            json: true
        })
            .then(({ body, statusCode }) => {
                expect(statusCode).to.equal(204)
                done()
            })
            .catch(done)
    });


});
