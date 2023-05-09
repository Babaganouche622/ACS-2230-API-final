require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

require('./data/custom-db')

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// const User = require('./models/user');

require('./controllers/user.js')(app);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

module.exports = app;
