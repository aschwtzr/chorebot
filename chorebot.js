/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/
This is a sample Slack bot built with Botkit.
This bot demonstrates many of the core features of Botkit:
* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.
# RUN THE BOT:
  Get a Bot token from Slack:
    -> http://my.slack.com/services/new/bot
  Run your bot from the command line:
    token=<MY TOKEN> node slack_bot.js
# USE THE BOT:
  Find your bot inside Slack to send it a direct message.
  Say: "Hello"
  The bot will reply "Hello!"
  Say: "who are you?"
  The bot will tell you its name, where it is running, and for how long.
  Say: "Call me <nickname>"
  Tell the bot your nickname. Now you are friends.
  Say: "who am I?"
  The bot will tell you your nickname, if it knows one for you.
  Say: "shutdown"
  The bot will ask if you are sure, and then shut itself down.
  Make sure to invite your bot into other channels using /invite @<my bot>!
# EXTEND THE BOT:
  Botkit has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var fs = require('fs');
var todayIndex

//Google Sheets vars
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var sheets = google.sheets('v4');
var choresArray = [];

// at ~/.credentials/sheets.googleapis.com-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.com-nodejs-quickstart.json';

// Load client secrets from a local file.

fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Sheets API.

  authorize(JSON.parse(content), loadChores);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

var controller = Botkit.slackbot({
    debug: false,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {
    process.exit();
    // bot.startConversation(message, function(err, convo) {
    //
    //     convo.ask('Are you sure you want me to shutdown?', [
    //         {
    //             pattern: bot.utterances.yes,
    //             callback: function(response, convo) {
    //                 convo.say('Bye!');
    //                 convo.next();
    //                 setTimeout(function() {
    //                     process.exit();
    //                 }, 3000);
    //             }
    //         },
    //     {
    //         pattern: bot.utterances.no,
    //         default: true,
    //         callback: function(response, convo) {
    //             convo.say('*Phew!*');
    //             convo.next();
    //         }
    //     }
    //     ]);
    // });
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

 controller.hears(['today',"today's chores",'who has chores'],
 'direct_message,direct_mention,mention', function(bot, message) {

   bot.reply(message, "Chores today: " + choresArray[todayIndex][1] + " " + choresArray[todayIndex][2] + " " + choresArray[todayIndex][3]+ " " + choresArray[todayIndex][4]);

 });

 controller.hears(["who's next",'coming up','upcoming'],
 'direct_message,direct_mention,mention', function(bot, message) {

   bot.reply(message,"Upcoming chores: \n" + choresArray[todayIndex+1] + "\n" + choresArray[todayIndex + 2]+ "\n" + choresArray[todayIndex + 3]+ "\n" + choresArray[todayIndex + 4]+ "\n" + choresArray[todayIndex + 5]+ "\n" + choresArray[todayIndex + 6])

 });

 controller.hears(['reload',"refresh",'load','spreadsheet'],
 'direct_message,direct_mention,mention', function(bot, message) {

       fs.readFile('client_secret.json', function processClientSecrets(err, content) {
         if (err) {
           console.log('Error loading client secret file: ' + err);
           return;
         }
         authorize(JSON.parse(content), loadChores);
       });

       bot.reply(message, "Done. Today's chores are at row " + todayIndex + ". Check the calendar at https://docs.google.com/spreadsheets/d/1cxTT0BzVX8O6pjQHzDAYiYip5bLELp8wCiBz3J1J6lQ/edit#gid=0");

 });

//TODO: this.
 controller.hears(['my chores'], 'direct_message,direct_mention,mention', function(bot, message) {


     });

function loadChores(auth) {
  var date = new Date();

  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1cxTT0BzVX8O6pjQHzDAYiYip5bLELp8wCiBz3J1J6lQ',
    range: 'Sheet1!L1:P',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    var rows = response.values;
    choresArray = rows
    console.log(choresArray)
    if (rows.length == 0) {
      console.log('No data found.');
    } else {
      for(var i = 0; i < rows.length; i++) {
        if (rows[i][0] == date.toDateString()) {
          console.log(i);
          todayIndex = i
          return i;
        }
      }
    }
  });
}
