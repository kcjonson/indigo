indigo = require('./lib/indigo.js');

indigo.connectServer({
	host: 'server.local',
	port: 8176,
	serverPath: '/',
	variablesPath: 'variables/'
});

indigo.setVariable('isAway', false);