module.exports = function (app, config) {
    return new Logger(app, config);
}

var _                      = require('lodash');

var defaultOptions = {
	output:  'console',
	level:   'debug'
}

Logger = function(app, config) {
    this.app    = app;
    this.config = config.logger ? _.defaults(config.logger, defaultOptions) : defaultOptions;

    return this;
}

Logger.prototype.write = function(type, message) {
	switch(this.config.output) {
		case 'console':
			console[type](message);
			break;
	}
}

Logger.prototype.info = function(message) {
	this.write('info', message);
}

Logger.prototype.debug = function(message) {
	this.write('log', message);
}

Logger.prototype.error = function(message) {
	this.write('error', message);
}