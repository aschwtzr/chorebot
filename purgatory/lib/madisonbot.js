# lib/madisonbot.js

'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var Bot = require('slackbots');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');


// create a bot
var MadisonBot = function Constructor (settings){
    this.settings = settings;
    this.settings.name = this.settings.name || 'madisonbot'
    this.user = null;
    this.db = null;
};

util.inherits(MadisonBot,Bot);

module.exports = MadisonBot;


MadisonBot.prototype.run = function () {
    MadisonBot.super_.call(this, this.settings);
    this.on('start', this._onStart);
    this.on('message', this._onMessage);
};

MadisonBot.prototype._onStart = function () {
    this._loadBotUser();
    this._welcomeMessage();
    // this._connectDb();
    // this._firstRunCheck();
};

MadisonBot.prototype._loadBotUser = function () {
    var self = this;
    this.user = this.users.filter(function (user) {
        return user.name === self.name;
    })[0];
};

MadisonBot.prototype._welcomeMessage = function () {
    this.postMessageToChannel('botsstuff', 'sup frends' +
        '\n I cannot do a whole lot right now because my master is useless. Somday you will call ' + this.name + '` to invoke me!',
        {as_user: true});
};

MadisonBot.prototype._onMessage = function (message) {
    if (this._isChatMessage(message) &&
        this._isChannelConversation(message) &&
        !this._isFromNorrisBot(message) &&
        this._isMentioningChuckNorris(message)
    ) {
        this._replyWithRandomJoke(message);
    }
};

// helper functions 
MadisonBot.prototype._isChatMessage = function (message) {
    return message.type === 'message' && Boolean(message.text);
};

NorrisBot.prototype._isChannelConversation = function (message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C';
};
