#!/usr/bin/env node

require('datejs');
var path = require('path');
var Bot = require('slackbots');
var Bamboohr = require(path.join(__dirname, 'bamboo.js'));
var config = require(path.join(__dirname, 'config.json'));

var bot = new Bot({
	token: config.token,
	name: 'utilibot'
});
var bamboo = new Bamboohr({
	apikey: config.bamboo_token,
	subdomain: config.subdomain
});

var params = {
	icon_emoji: ':robot_face:'
};
bot.on('start', function() {
	//bot.postMessageToChannel('bot_testing', 'Take the new OOO bot for a test drive.', params);
});

// start param needs to be a date object
// Iterate through the time off requests and build/return the response array.
function _build_ooo(employees, start) {
	if (!start) {
		start = Date.today();
	}

  // Sort by name, alphabetically, because what Herchel wants, Herchel gets!
  // Herchel for President!
  employees.sort(sortOn("name"));

	var ooo = new Array();
	ooo.push('*OOO for ' + start.toString('dddd, MMM d yyyy') + '*');

	Object.keys(employees).forEach(function(key) {
		var e = employees[key];
		if (e.type == 'timeOff') {
			var ooo_date = null;
			if (e.end != start.toString('yyyy-MM-dd')) {
				var date = Date.parse(e.end);
				ooo_date = ' _until ' + date.toString('MMM. d') + '_';
			}

			if (!ooo_date) {
				ooo.push(e.name);
			} else {
				ooo.push(e.name + ooo_date);
			}
		} else if (e.type == 'holiday') {
			ooo.push('*' + e.name + '*');
		}
	});
	if (!ooo[1]) ooo.push('_Everyone will be in the office._');
	return ooo;
}

function sortOn(property){
  return function(a, b){
    if(a[property] < b[property]) {
      return -1;
    } else if(a[property] > b[property]) {
      return 1;
    } else {
      return 0;   
    }
  }
}

// Slack needs channel names rather than channel ids. 
function _getChannelById(channel_id) {
  return bot.channels.filter(function (item) { 
    return item.id === channel_id; 
  })[0];
}

// Watch Slack messages to respond to requests of the bot.
bot.on('message', function(message) {
	var text = String(message.text).toUpperCase();
  
	if (message.type === 'message') {
		// The default OOO request. Assume the current day as the OOO inquiry.
		if (text == '000?' || text == 'OOO?') {
			var today = Date.today().toString('yyyy-MM-dd');
			bamboo.getWhosOut({
				start: today,
				end: today
			}, function(err, employees) {
				bot.postMessageToChannel(_getChannelById(message.channel).name, _build_ooo(employees).join('\r\n'), params);
			});
		}
		
		// Would be cool to pass in a date like [ooo May 9?] 
		else if (/^OOO/.test(text) || /^000/.test(text)) {
			var regex = /(^OOO|^000) (.*)[?]$/;
			var result = text.match(regex);
			var start = Date.parse(result[2]);
			if (start) {

				if (start < Date.today()) start = start.next().year();

				bamboo.getWhosOut({
					start: start.toString('yyyy-MM-dd'),
					end: start.toString('yyyy-MM-dd')
				}, function(err, employees) {
					bot.postMessageToChannel(_getChannelById(message.channel).name, _build_ooo(employees, start).join('\r\n'), params);
				});

			} else {
				bot.postMessageToChannel(_getChannelById(message.channel).name, "Hrm. I don't understand the date: " + result[2], params);
			}
		}

	}
});
