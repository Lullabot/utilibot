#!/usr/bin/env node

var path 			= require('path');
var Bot 			= require('slackbots');
var datejs    = require('datejs');
var Bamboohr	= require(path.join(__dirname, 'bamboo.js'));
var config 		= require(path.join(__dirname, 'config.json'));

var bot 		= new Bot({token: config.token, name: 'utilibot'});
var bamboo 	= new Bamboohr({apikey: config.bamboo_token, subdomain: config.subdomain});
 
var params = {icon_emoji: ':robot_face:'};
bot.on('start', function() {
	bot.postMessageToChannel('general', 'Take the new OOO bot for a test drive.', params);
});

/**
 * @param {object} data 
 */
bot.on('message', function(message) {
	var text = String(message.text).toUpperCase();
	
	if (message.type === 'message') {
		
		if (text == '000?' || text == 'OOO?') {
		  var today = Date.today().toString('yyyy-MM-dd');
			bamboo.getWhosOut({start: today, end: today}, function(err, employees) {
				var ooo = new Array();
				ooo.push('*OOO for '+Date.today().toString('dddd, M/d/yyyy')+'*');
				Object.keys(employees).forEach(function(key) {
				  var e = employees[key];
				  if (e.type == 'timeOff') {
					  var ooo_date = null;
						if (e.end != today) {
							var date = Date.parse(e.end);
							ooo_date = ' _(until '+ date.toString('M/d') + ')_';
						}

						if (!ooo_date) {
							ooo.push(e.name);
						}
						else {
							ooo.push(e.name + ooo_date);
						}
					}
					else if (e.type == 'holiday') {
						ooo.push('*'+ e.name + '*');
					}
				});
				bot.postMessageToChannel('general', ooo.join('\r\n'), params);
			});
		}
		// Would be cool to pass in a date like [ooo May 9?] 
		else if (/^OOO/.test(text) || /^000/.test(text)) {
			var regex = /(^OOO|^000) (.*)[?]$/;
			var result = text.match(regex);
			var start = Date.parse(result[2]);
			if (start) {
				
				if (start < Date.today()) start = start.next().year();
				
				bamboo.getWhosOut({start: start.toString('yyyy-MM-dd'), end: start.toString('yyyy-MM-dd')}, function(err, employees) {
					var ooo = new Array();
					ooo.push('*OOO for '+start.toString('dddd, M/d/yyyy')+'*');
					Object.keys(employees).forEach(function(key) {
					  var e = employees[key];
					  if (e.type == 'timeOff') {
						  var ooo_date = null;
							if (e.end != today) {
								var date = Date.parse(e.end);
								ooo_date = ' _(until '+ date.toString('M/d') + ')_';
							}

							if (!ooo_date) {
								ooo.push(e.name);
							}
							else {
								ooo.push(e.name + ooo_date);
							}
						}
						else if (e.type == 'holiday') {
							ooo.push('*'+ e.name + '*');
						}
					});
					bot.postMessageToChannel('general', ooo.join('\r\n'), params);
				});
				
			}
			else {
				bot.postMessageToChannel('general', "Hrm. I don't understand the date: "+result[2], params);
			}
		}
		
	}
});
