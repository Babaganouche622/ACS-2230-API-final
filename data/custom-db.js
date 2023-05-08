require('dotenv').config();
const mongoose = require('mongoose');

// Production environment
const ATLAS_USER = process.env.ATLAS_USER;
const ATLAS_PASSWORD = process.env.ATLAS_PASSWORD;
const ATLAS_URI_START = process.env.ATLAS_URI_START;
const ATLAS_URI_END = process.env.ATLAS_URI_END;

// Testing environment
const TEST_ATLAS_USER = process.env.TEST_ATLAS_USER;
const TEST_ATLAS_PASSWORD = process.env.TEST_ATLAS_PASSWORD;
const TEST_ATLAS_URI_START = process.env.TEST_ATLAS_URI_START;
const TEST_ATLAS_URI_END = process.env.TEST_ATLAS_URI_END;

// Setup test database
const url = process.env.NODE_ENV === "test" 
? `${TEST_ATLAS_URI_START}${TEST_ATLAS_USER}:${TEST_ATLAS_PASSWORD}${TEST_ATLAS_URI_END}`
: `${ATLAS_URI_START}${ATLAS_USER}:${ATLAS_PASSWORD}${ATLAS_URI_END}`;

mongoose.connect(url, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected successfully to database');
  })
  .catch((error) => {
    console.log('Failed to connect to database:', error);
  });

mongoose.connection.on('error', (error) => {
  console.log('MongoDB connection error:', error);
});
mongoose.set('debug', true);

module.exports = mongoose.connection;