var ready = require('enyo/ready'),
	App = require('./src/App');

ready(function () {
	new App().renderInto(document.body);
});