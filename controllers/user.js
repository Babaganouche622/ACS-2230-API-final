require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const axios = require('axios');
const checkAuth = require('../middleware/checkAuth');

module.exports = (app) => {
  // INDEX
  app.get('/', (req, res) => {
    res.json({ message: 'Hello World' });
  });

  // SIGNUP
  app.post('/sign-up', async (req, res) => {
    try {
      // Create User
      const user = new User(req.body);
      const response = await axios.get('https://foaas.com/programmer/bob', { headers: { 'Accept': 'application/json' } });
      user.catchPhrase = response.data.message;
      await user.save();

      // Create JWT token
      const token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "60 days" });
      // Set cookie
      res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
      res.redirect('/');
    } catch (err) {
      if (err.name === 'MongoError' && err.code === 11000) {
        // Duplicate key error - username already taken
        return res.status(409).send('Email already taken');
      }
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  });

  // LOGIN
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      // Find this user email
      const user = await User.findOne({ email }, 'email password');
      if (!user) {
        // User not found
        return res.status(401).send({ message: 'Wrong email or Password' });
      }
      // Check the password
      user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          // Password does not match
          return res.status(401).send({ message: 'Wrong email or password' });
        }
        // Create a token
        const token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET, {
          expiresIn: '60 days',
        });
        // Set a cookie and redirect to root
        res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
        res.redirect(`/users/${user._id}`);
      });
    } catch (err) {
      console.log(err);
    };
  });

  // LOGOUT
  app.get('/logout', (req, res) => {
    res.clearCookie('nToken');
    res.redirect('/');
  });

  // SHOW all
  app.get('/users', checkAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).send('Unauthorized. Please login.');
      }
      const users = await User.find();
      res.json({ users });
    } catch (err) {
      console.log(`Get users error: ${err}`);
      res.status(500).json({ error: err.message });
    }
  });

  // SHOW one
  app.get('/users/:id', checkAuth, async (req, res) => {
    try {
      if (!req.currentUser) {
        return res.status(401).send('Unauthorized. Please login.');
      }
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
  app.put('/users/:id/update', checkAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).send('Unauthorized. Please login.');
      }
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
  app.delete('/users/:id/delete', checkAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).send('Unauthorized. Please login.');
      }
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

  // Route to attack another user
  app.post('/users/:playerId/attack', async (req, res) => {
    try {
      const attackingUser = await User.findById(req.params.playerId);
      const targetUser = await User.findById(req.body.enemyId);
      if (!attackingUser || !targetUser) {
        return res.status(404).send();
      }
      let levelUpMessage;
      const attackValue = attackingUser.attack;
      targetUser.currentHealth -= attackValue;
      attackingUser.experience += 10;
      if (attackingUser.experience >= 100) {
        attackingUser.level += 1;
        attackingUser.experience = 0;
        attackingUser.attack += 5;
        attackingUser.maxHealth += 50;
        attackingUser.currentHealth = attackingUser.maxHealth;
        levelUpMessage = `${attackingUser.name} leveled up!`;
      }

      await targetUser.save();
      await attackingUser.save();

      res.send({
        attackingUser,
        targetUser,
        message: `${attackingUser.name} uses catch phrase: ${attackingUser.catchPhrase} and deals ${attackValue} damage to ${targetUser.name}! ${levelUpMessage === undefined || null ? '' : levelUpMessage}`,
      });
    } catch (e) {
      res.status(500).send();
    }
  });

  app.post('/users/:playerId/heal', async (req, res) => {
    try {
      const user = await User.findById(req.params.playerId);
      if (!user) {
        return res.status(404).send();
      }

      const healValue = req.body.healValue || 10;
      if (user.currentHealth + healValue > user.maxHealth) {
        user.currentHealth = user.maxHealth;
      } else {
        user.currentHealth += healValue;
      }

      await user.save();

      res.send({
        user,
        message: `${user.name} was healed!!`,
      });
    } catch (e) {
      res.status(500).send();
    }
  });

  app.get('/edit-catch-phrase', checkAuth, async (req, res) => {
    try {
      // Retrieve user from JWT token
      if (!req.user) {
        return res.status(401).send('Unauthorized. Please login.');
      }
      const response = await axios.get('https://foaas.com/operations', { headers: { 'Accept': 'application/json' } });
      const operations = response.data;
      res.status(200).send({ operations });
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  }); 

  app.put('/:id/edit-catch-phrase', checkAuth, async (req, res) => {
    try {
      // Retrieve user from JWT token
      if (!req.user) {
        return res.status(401).send('Unauthorized. Please login.');
      }
      const user = await User.findById(req.params.id);
  
      // Fetch new catch phrase from foaas API
      const response = await axios.get(`https://foaas.com/${req.body.operation}/${user.name}`, { headers: { 'Accept': 'application/json' } });
      const newCatchPhrase = response.data.message;
  
      // Update user's catch phrase
      user.catchPhrase = newCatchPhrase;
      await user.save();
  
      res.status(200).send('Catch phrase updated successfully');
    } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
  });
};
