indigo = require('./lib/indigo.js');

indigo.connectServer({
	host: 'server.local',
	port: 8176,
	serverPath: ''
});

//indigo.setVariable('isAway', false);



/*
indigo.getDevices(function(devices){
	console.log('devices', devices);
});
*/

/*
indigo.getDevice('Downstairs Overhead Lights', function(device){
	console.log('device', device);
});
*/


/*
indigo.getVariable('isAway', function(variable) {
	console.log(variable);
});
*/
