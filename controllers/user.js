require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

module.exports = (app) => {
  console.log("Am I here?")

  // SIGNUP
  app.post('/sign-up', async (req, res) => {
    try {
      // Create User
      const user = new User(req.body);
      await user.save();

      // Create JWT token
      const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
      // Set cookie
      res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
      res.redirect('/');
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate key error - username already taken
        return res.status(409).send('Username already taken');
      }
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  });

  // LOGIN
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      // Find this user name
      const user = await User.findOne({ username }, 'username password');
      if (!user) {
        // User not found
        return res.status(401).send({ message: 'Wrong Username or Password' });
      }
      // Check the password
      user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          // Password does not match
          return res.status(401).send({ message: 'Wrong Username or password' });
        }
        // Create a token
        const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, {
          expiresIn: '60 days',
        });
        // Set a cookie and redirect to root
        res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
        return res.redirect('/');
      });
    } catch (err) {
      console.log(err);
    }
  });

  // LOGOUT
  app.get('/logout', (req, res) => {
    res.clearCookie('nToken');
    res.redirect('/');
  });

  // INDEX
  app.get('/', (req, res) => {
    res.json({ message: 'Hello, world!' });
  });

  // SHOW
  app.get('/users', async (req, res) => {
  try {
      const users = await User.find();
      res.json({ users });
  } catch (err) {
      console.log(`Get users error: ${err}`);
      res.status(500).json({ error: err.message });
  }
  });

  // CREATE
  app.get('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const user = await User.findById(id);
      if (!user) {
          throw new Error('User not found');
      }
      res.json({ user });
  } catch (err) {
      console.log(`Get user error: ${err}`);
      res.status(404).json({ error: err.message });
  }
  });

  // UPDATE
  app.put('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.findByIdAndUpdate(id, { email, password: hashedPassword }, { new: true });
      if (!user) {
          throw new Error('User not found');
      }
      res.json({ user });
  } catch (err) {
      console.log(`Update user error: ${err}`);
      res.status(404).json({ error: err.message });
  }
  });

  // DELETE
  app.delete('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
          throw new Error('User not found');
      }
      res.json({ message: 'User deleted' });
  } catch (err) {
      console.log(`Delete user error: ${err}`);
      res.status(404).
      json({ error: err.message });
  }
  });
};
