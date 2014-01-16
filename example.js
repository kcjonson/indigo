indigo = require('./lib/indigo.js');

indigo.connectServer({
	host: 'server.local',
	port: 8176,
	serverPath: ''
});

//indigo.setVariable('isAway', false);

/*
indigo.getVariable('isAway', function(variable) {
	console.log(variable);
});
*/