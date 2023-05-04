require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, it } = require('mocha');
process.env.NODE_ENV = 'test';
const app = require('../server');

const should = chai.should();

chai.use(chaiHttp);

const agent = chai.request.agent(app);

const User = require('../models/user');
const user = require('../controllers/user');
const { default: mongoose } = require('mongoose');

describe('User', function () {
  before(async function () {
    const user = new User({
      email: 'example@nope.com',
      password: 'password',
      _id: '5d7a514b5d2c12c7449be042'
    });
    try {
      const savedUser = await user.save();
      this.userId = savedUser._id;
    } catch (err) {
      console.error(err);
    }
  });

  after(async function () {
    try {
      await User.deleteMany({});
      agent.close();
      process.env.NODE_ENV = 'development';
    } catch (err) {
      console.error(err);
    }
  });

  it('should not be able to login if they have not registered', function (done) {
    agent.post('/login', { email: 'wrong@example.com', password: 'nope' }).end(function (err, res) {
      res.status.should.be.equal(401);
      done();
    });
  });

  it('should be able to signup', function (done) {
    agent.post('/sign-up').send({ email: 'newexample@nope.com', password: 'password' }).end(function (err, res) {
      console.log(res.body);
      res.should.have.status(200);
      agent.should.have.cookie('nToken');
      done();
    });
  });

  it('should be able to login', function (done) {
    agent
    .post('/login')
    .send({ email: 'newexample@nope.com', password: 'password' })
    .end(function (err, res) {
      res.should.have.status(200);
      agent.should.have.cookie('nToken');
      done();
    });
  });

  it('should be able to logout', function (done) {
    agent.get('/logout').end(function (err, res) {
      res.should.have.status(200);
      agent.should.not.have.cookie('nToken');
      done();
    });
  });
});