var isbrowser = require('isbrowser');

var noop = function(){};

var Reset = "\x1b[0m";
var Bright = "\x1b[1m";
// var Dim = "\x1b[2m";
// var Underscore = "\x1b[4m";
// var Blink = "\x1b[5m";
// var Reverse = "\x1b[7m";
// var Hidden = "\x1b[8m";

// var FgBlack = "\x1b[30m";
var FgRed = "\x1b[31m";
// var FgGreen = "\x1b[32m";
var FgYellow = "\x1b[33m";
var FgBlue = "\x1b[34m";
// var FgMagenta = "\x1b[35m";
// var FgCyan = "\x1b[36m";
var FgWhite = "\x1b[37m";

// var BgBlack = "\x1b[40m";
// var BgRed = "\x1b[41m";
// var BgGreen = "\x1b[42m";
// var BgYellow = "\x1b[43m";
// var BgBlue = "\x1b[44m";
// var BgMagenta = "\x1b[45m";
// var BgCyan = "\x1b[46m";
// var BgWhite = "\x1b[47m";

var methods = [
	'none',
	'error',
	'warn',
	'info',
	'trace',
	'log'
];

var slice =  Array.prototype.slice;

var colors = {
	log : FgWhite,
	info : FgBlue,
	warn : FgYellow,
	error : FgRed
};

var tracer = {};

Object.defineProperty(tracer, 'stack', {
	get: function(){
		var orig = Error.prepareStackTrace;
		Error.prepareStackTrace = function(tracer, stack){ return stack; };
		var err = new Error;
		Error.captureStackTrace(err, arguments.callee);
		var stack = err.stack;
		Error.prepareStackTrace = orig;
		return stack;
	}
});

Object.defineProperty(tracer, 'line', {
	get: function(){
		return tracer.stack[2].getLineNumber();
	}
});

Object.defineProperty(tracer, 'file', {
	get: function(){
		return tracer.stack[2].getFileName().split('/').pop();
	}
});


function colorize(console) {
	if(!console._colorized) {
		console._colorized = true;
		Object.keys(colors).forEach(function(method) {
			var oldMethod = console[method];
			console[method] = function(){
				var args = slice.call(arguments);
				var type = typeof args[0];
				if(type === 'string' || type === 'number' || type === 'boolean') {
					args[0] = colors[method] + method.toUpperCase() + ' : ' + tracer.file + '(' + tracer.line + ') => ' + Bright + args[0] + Reset;
					oldMethod.apply(console, args);
				} else {
					oldMethod.call(console, colors[method] + method.toUpperCase() + ' : ' + tracer.file + '(' + tracer.line + ') => ' + Bright);
					oldMethod.apply(console, arguments);
					oldMethod.call(console, Reset);
				}
			};
		});
	}
}

function levelize(console, lvl){
	if(!console._methods) {
		console._methods = {};
		methods.forEach(function(method){
			console._methods[method] = console[method];
		});
	}
	
	if(lvl === undefined) {
		if(process && process.env && process.env.LOG_LEVEL) {
			lvl = process.env.LOG_LEVEL;
		} else {
			lvl = 'log';
		}
	}
	
	lvl = !lvl ? 0 : methods.indexOf(lvl);;
	
	for(var i = lvl; i < methods.length - 1; i++) {
		console[methods[i+1]] = noop;
	}

	for(var j = 1; j <= lvl; j++) {
		console[methods[j]] = console._methods[methods[j]];
	}
}

var consolekit = function(lvl){
	if (!process.browser) {
		colorize(console);
		levelize(console, lvl);
	}
};

if(process.browser) {
	consolekit.console = console;
} else {
	consolekit.console = {};

	methods.forEach(function(method){
		consolekit.console[method] = console[method];
	});
	
	colorize(consolekit.console);
}


consolekit.console.init = consolekit.init = function(lvl) {
	if (!process.browser) {
		levelize(consolekit.console, lvl);
	}
};

exports = module.exports = consolekit;
