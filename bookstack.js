const sendEmail = require('./emailSender');
const debug = require('./debug');

const baseURL = process.env.baseURL;
const authToken = process.env.authToken;

const axios = require('axios').default;
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Authorization'] = authToken;

const fs = require('fs');
const notifications = {};
let [tags, whitelistDomains] = loadOptions();
printOptions();

async function searchTag(tag) {
    try {
      const response = await axios.get('/search', {
        params: {
          query: "[" + tag + "]",
        },
      });
      return response.data.data;
    } catch (error) {
      console.error(`Error searching for tag ${tag}: ${error.message}`);
      return null;
    }
  }

 // Use Promise.all to wait for all API requests to complete
async function searchTags(tags) {
    const promises = tags.map(tag => searchTag(tag));
    const results = await Promise.all(promises);
    return results.filter(result => result !== null);
  }

// Find all users for the selected tag and record
// them in the notifications array
function processPages(results, tags) {
  try {
    results.forEach(pages => {
      pages.forEach(page => {
        debug(4, "Processing page: (" + page.id + " - " + page.name + ")");
        // debug(2, "Processing page: (" + page.id + " - " + page.name + ")");
        // search through all the tags
        debug(5, "Page %s - %s has the following tags:", page.id, page.name);
        debug(5, page.tags);
        page.tags.forEach(tag => {
          if( tags.includes(tag.name) && tag.value != "" ) {
            debug(6, "Found tag: " + tag.name + " with a value of " + tag.value);
            addNotificationRecord(page, tag);
          }
        })
      })
    })
  } catch (error) {
    console.error(`Error processing pages: ${error.message}`);
    return null;
  }
}

function addNotificationRecord(page, tag) {
  if( notifications[tag.value] ) {
    // this objectExists check is necessary because if you are looking for multiple
    // tags, you can get the same page back multiple times in the result set
    if(objectExists(notifications[tag.value], page) === false ) {
      debug(3, "Adding a notification for %s for page %s - %s", tag.value, page.id, page.name);
      notifications[tag.value].push(page);
    } else {
      debug(3, "Skipping a notification for %s for page %s - %s because it already exists", tag.value, page.id, page.name);
    }
  } else {
    notifications[tag.value] = [page];
  }
}

function objectExists(arr, obj) {
  return arr.some(item => item.id === obj.id);
}

function printOptions() {
  debug(1, "Searching for the following tags:");
  debug(1, tags);
  debug(1, "");
  debug(1, "The following domains are whitelisted:");
  debug(1, whitelistDomains);
  debug(1, "");
}
function printNotifications() {
  for( let email in notifications) {
    let body = createEmailBody(notifications[email]);
    let domain = extractDomain(email);
    let whitelistResult = whitelistDomains.includes(domain) ? "Accepted" : "Rejected";

    console.log("");
    console.log("Matches found for: " + email+ " (" + whitelistResult + ")");
    console.log("======================================");

    notifications[email].forEach(page => {
      console.log("Page id: " + page.id + " - " + page.name);
    })
  }
  console.log("");
}

function createEmailBody(pages) {
  // Generate the table rows for the results
  //   debug(3, "Creating table rows");
  let tableRows = pages.map(page => {
    return `<tr>
              <td>${page.id}</td>
              <td><a href="${page.url}" target="_new">${page.name}</a></td>
              <td>${page.updated_at}</td>
            </tr>`;
  }).join('');
  debug(7,tableRows);

  // Create the HTML body
  let htmlBody = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <p>Someone has tagged you on the following pages.<br />
        Please review the pages and remove your tag if you have completed reviewing / updating the page.</p>
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Updated At</th>
          </tr>
          ${tableRows}
        </table>
      </body>
    </html>
  `;
  debug(7,htmlBody);

  return htmlBody;
}

function sendNotifications() {
  for( let email in notifications ) {
    let domain = extractDomain(email);
    let whitelistAccepted = whitelistDomains.includes(domain) ? true : false;
    if( whitelistAccepted ) {
      let body = createEmailBody(notifications[email]);
      sendEmail(email, 'Bookstack notifications', body);
    } else {
      debug(1, email + ": Rejected - " + domain + " not on the whitelist");
    }
  }
}

function extractDomain(email) {
  const match = email.match(/@(.+)/);
  return match ? match[1] : null;
}

function loadOptions() {
  try {
    const data = fs.readFileSync('options.json', 'utf8');
    try {
      const jsonData = JSON.parse(data);
      return [jsonData.tags, jsonData.whitelistDomains];
    } catch (err) {
      console.error('Error parsing JSON data:', err);
    }
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

// Call the function to search for all tags
function bookstack(dryRun, verboseLevel) {

  if( tags.length ) {
    searchTags(tags)
      .then(results => {
        // Combine the results here
        try {
          processPages(results, tags);
        } catch(error) {
          console.log("Error processing pages: " + error.message);
        }
        try {
          if( verboseLevel >= 1 ) {
            printNotifications();
          }
        } catch(error) {
          console.log("Error printing notifications: " + error.message);
        }
        try {
          if( dryRun === false ) {
            sendNotifications();
          } else {
            console.log("Emails not sent due to dry run mode");
          }
        } catch(error) {
          console.log("Error sending notifications: " + error.message);
        }
      })
      .catch(error => {
        console.error('Error searching for tags:', error.message);
      });
    } else {
      console.log("No tags defined.  Add tags in JSON format in tags.json");
    }
}

module.exports = bookstack;