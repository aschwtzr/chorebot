'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SlackBot = require('slackbots');


// create a bot
var bot = new SlackBot({
    token: '', // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'chorebot'
});

bot.on('start', function() {
    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    bot.postMessageToChannel('general', 'chorebot is running.');
});

bot.on('message', function(message){


});
