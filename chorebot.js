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
    bot.postMessageToChannel('general', 'Yo! I am chorebot. You can ask me about your upcoming chores, who has chores today or whether a roomate has confirmed their chores today. Type "chorebot help" for more info.');
});

bot.on('message', function(message){


});
