require('dotenv').config();
const bookstack = require('./bookstack');

const args = process.argv.slice(2);
bookstack();