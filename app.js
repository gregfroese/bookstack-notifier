require('dotenv').config();
const bookstack = require('./bookstack');
const helpInstructions = require('./helpInstructions');
const loadCommandLineOptions = require('./commandLineOptions');
let [dryRun, verboseLevel, showHelp] = loadCommandLineOptions();

if( showHelp ) {
  helpInstructions();
}

if( showHelp === false ) {
  bookstack.start(dryRun, verboseLevel);
  // bookstack.readData();
}