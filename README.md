# Bookstack Notifier
This script provides simple workflow by alerting tagged users that they have a page on Bookstack that requires their attention.
## Installation
### Prerequisites
1. NodeJS
2. 
TBD
## Usage
1. On your Bookstack instance, add a tag to a page and put in an email address for the value
2. Update the options.json file with the name of the tag(s) you want to monitor.
3. Be sure to also whitelist the domains that you want to allow sending of notifications in options.json
4. Copy sample.env to .env and update values accordingly (you may need to add authorization details to emailSender.js)
5. Review script options: `node app.js --help`
6. Test script results with: `node app.js --dry-run`
  1. You can see more details of what it is doing by using the `-v` parameter up to `-v 7` for higher verbosity

When run without `--dry-run`, all pages will be searched for the monitored tags and the email addresses in the value of the tags will be used to send out a notification if that email domain is on the whitelist.
