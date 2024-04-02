require('dotenv').config();
const baseURL = process.env.baseURL;
const authToken = process.env.authToken;

const args = process.argv.slice(2);
const DEBUG = args[0];  //1 = see which emails will get updates for which pages
                        // 2 = See search results as they happen
                        // 3 = See the table rows
                        // 4 = See the whole email body
                        // Email doesn't get sent if any debug value is set

const sendEmail = require('./emailSender');

const axios = require('axios').default;
axios.defaults.baseURL = baseURL;
axios.defaults.headers.common['Authorization'] = authToken;

const notifications = {};
let tags = ["monitor"];

function debug(level, message) {
  if( level <= DEBUG ) {
    console.log(message);
  }
}

async function searchTag(tag) {
    try {
      debug(2, "Searching for " + tag);
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
function processPages(results) {
  try {
    results.forEach(pages => {
      pages.forEach(page => {
        // console.log("Processing page: (" + page.id + " - " + page.name + ")");
        debug(2, "Processing page: (" + page.id + " - " + page.name + ")");
        // search through all the tags
        page.tags.forEach(tag => {
          if( tags.includes(tag.name) && tag.value != "" ) {
            debug(2, "Found tag: " + tag.name + " with a value of " + tag.value);
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
    notifications[tag.value].push(page);
  } else {
    notifications[tag.value] = [page];
  }
}

// This is just for debugging
function printNotifications() {
  if( 1 <= DEBUG ) { //don't even bother going in here if you don't have to
    for( let email in notifications) {
      debug(1, "");
      debug(1, "Notifications for: " + email);
      debug(1, "======================================");
      notifications[email].forEach(page => {
        debug(1, "Page: " + page.name);
      })
    }
  }
}

function createEmailBody(pages) {
  // Generate the table rows for the results
  debug(3, "Creating table rows");
  let tableRows = pages.map(page => {
    return `<tr>
              <td>${page.id}</td>
              <td><a href="${page.url} target="_new">${page.name}</a></td>
              <td>${page.updated_at}</td>
            </tr>`;
  }).join('');
  debug(3,tableRows);

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
        <p>These are the pages that have changed where you have been tagged</p>
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
  debug(4,htmlBody);

  return htmlBody;
}

function sendNotifications() {
  for( let email in notifications ) {
    let body = createEmailBody(notifications[email]);
    sendEmail(email, 'Bookstack notifications', body);
  }
}

// Call the function to search for all tags
searchTags(tags)
  .then(results => {
    // Combine the results here
    try {
      processPages(results);
    } catch(error) {
      console.log("Error processing pages: " + error.message);
    }
    try {
      printNotifications();
    } catch(error) {
      console.log("Error printing notifications: " + error.message);
    }
    try {
      if( typeof DEBUG === 'undefined' ) {
        sendNotifications();
      } else {
        debug(1, "Emails not sent due to debugging");
      }
    } catch(error) {
      console.log("Error sending notifications: " + error.message);
    }
  })
  .catch(error => {
    console.error('Error searching for tags:', error.message);
  });

