const loadCommandLineOptions = require('./commandLineOptions');
let [dryRun, verboseLevel, showHelp] = loadCommandLineOptions();

function debug(level, message) {
  if (level <= verboseLevel) {
    console.log(message);
  }
}

module.exports = debug;