function loadCommandLineOptions() {
  const args = require('minimist')(process.argv.slice(2));

  let dryRun = args['dry-run'] || false;
  let verboseLevel = 0;
  let showHelp = args['help'] || false;

  if (args.v) {
    verboseLevel += (typeof args.v === 'boolean' ? 1 : args.v);
  }
  if( dryRun && verboseLevel == 0 ) {
    verboseLevel = 1;
  }

  return [dryRun, verboseLevel, showHelp];
}

module.exports = loadCommandLineOptions;