#!/usr/bin/env node

console.log('Starting Utilibot Slackbot...');

var path 			= require('path');
var Bot 			= require('slackbots');
var Bamboohr	= require(path.join(__dirname, 'bamboo.js'));
var config 		= require(path.join(__dirname, 'config.json'));

var bot 		= new Bot({token: config.token, name: 'utilibot'});
var bamboo 	= new Bamboohr({apikey: config.bamboo_token, subdomain: config.subdomain});
 
bot.on('start', function() {
	var params = {icon_emoji: ':robot_face:'};
	bot.postMessageToChannel('twitter', 'Ooh. I have the power!', params);
});

/**
 * @param {object} data 
 */
bot.on('message', function(message) {
	var text = String(message.text).toUpperCase();
	if (message.type === 'message' && (text == '000?' || text == 'OOO?')) {
		var out = bamboo.getWhosOut();
		console.log(out);
	}
	
});
