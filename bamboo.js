var request = require('request');

/**
 * @param {object} params
 * @constructor
 */
function BambooHR(params) {
	this.apikey			= params.apikey;
  this.subdomain 	= params.subdomain;

  assert(params.apikey, 'apikey must be defined');
	assert(params.subdomain, 'Subdomain must be defined');
}

/**
 * Get groups
 * @returns {vow.Promise}
 */
BambooHR.prototype.getWhosOut = function() {
	return this._api('/v1/time_off/whos_out/');
};

/**
 * Send request to API method
 * @param {string} methodName
 * @param {object} params
 * @returns {vow.Promise}
 * @private
 */
BambooHR.prototype._api = function(path, params) {
	var data = {
  	url: 'https://'+ this.apikey +':x@api.bamboohr.com/api/gateway.php/' + this.subdomain + path,
		headers: {
			Accept: 'application/json'
		}
  };

 	request.get(data, function(err, response, body) {
   	if (err) {
     	return err;
     }
     try {
     	body = JSON.parse(body);

       // Response always contain a top-level boolean property ok,
       // indicating success or failure
       if (body.ok) {
       	return body;
       } else {
       	return error;
       }
     } catch (e) {
     	return e;
     }
   });
};

function assert(condition, error) {
	if (!condition) {
  	throw new Error('[Utili Bot Error] ' + error);
  }
}

module.exports = BambooHR;