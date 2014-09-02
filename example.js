indigo = require('./lib/indigo.js');

indigo.connectServer({
	host: 'localhost',
	port: 8176,
	serverPath: '/indigo'
});


indigo.executeAction('Turn Off All Lights');
//indigo.executeAction('Pause');




//indigo.setVariable('isAway', false);


/*
indigo.getDevices(function(devices){
	//console.log('devices', devices);
	var numDevices = devices.length;
	var numOnDevices = 0;
	var numDevicesRead = 0;
	devices.forEach(function(device){
		indigo.getDevice(device.name, function(device){
			//console.log(device);
			numDevicesRead += 1;
			if (device.isOn) {
				numOnDevices += 1;
			};
			if (numDevicesRead == numDevices) {
				console.log(numOnDevices + ' of ' + numDevices + ' devices are currently on');
			};
		})
	});
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
