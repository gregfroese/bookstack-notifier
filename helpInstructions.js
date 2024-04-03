function helpInstructions() {
  let helpText = `
    Usage: node app.js [-v] [-v #] [--dry-run] [--help]

      --dry-run     Suppresses emails from being sent.
                    Defaults to -v 1 to display matches found.
      -v [#]        Show logging.  Use -v 2 or higher to increase verbosity.
      --help        Show this info.
  `;
  console.log(helpText);
}

module.exports = helpInstructions;