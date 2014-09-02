(function () {
	 'use strict';
	 
	var http = require('http');
	var xml2js = require('xml2js');
	var serverParams;
	var variables;
	var devices;
	var actions;
	
	
	
// Public API
	
	exports.connectServer = function(params) {
		serverParams = {};
		variables = {};
		devices = {};
		serverParams.host = params.host || 'localhost';
		serverParams.port = params.port || '8176';
		serverParams.serverPath = params.serverPath || '';
	};
	
	exports.setVariable = function(name, value, successCallback, errorCallback) {
		log('Setting Indigo variable: ' + name + ' to: ' + value);
		
		readVariables(function(){
			if (!variables[name]) {
				log('Variable does not exist on server');
				return false;
			}
			var path = serverParams.variablesPath + name + '?_method=put&value=' + value;
			getFromServer(path, function(){
				// TODO Verify if set correctly
				if (successCallback) {successCallback()};
			}, errorCallback);
		});
	};
	
	exports.getVariables = function(successCallback, errorCallback) {
		// TODO: Return array of variables
	};
	
	exports.getVariable = function(name, successCallback, errorCallback) {
		log('Getting Indigo variable: ' + name);
		checkAndProceed(true);		
		function checkAndProceed(read) {
			if (variables[name]) {
				getFromServer(variables[name].xmlPath, function(payload){
					parseVariableXML(payload, successCallback, errorCallback)
				});
			} else if (read) {
				readVariables(function(){
					checkAndProceed(false);
				});
			} else {
				log('Variable does not exist on server');
			}
		};
	};
	
	exports.getDevices = function(successCallback, errorCallback) {
		log('Getting Indigo Devices');
		readDevices(function(){
			var devicesArray = [];
			for (var key in devices) {
				if (devices.hasOwnProperty(key)) {
					devicesArray.push(devices[key]);
				};
			}
			successCallback(devicesArray);
		});
	};
	
	exports.getDevice = function(name, successCallback, errorCallback) {
		log('Getting Indigo devices: ' + name);
		checkAndProceed(true);		
		function checkAndProceed(read) {
			if (devices[name]) {
				getFromServer(devices[name].xmlPath, function(payload){
					parseDeviceXML(payload, successCallback, errorCallback)
				});
			} else if (read) {
				readDevices(function(){
					checkAndProceed(false);
				});
			} else {
				log('Device does not exist on server');
			}
		};
	};

	// Switching the callback style on this one, not
	// really sure which way I like better. Feel free to offer 
	// an opinion and I'll switch it. -KCJ
	exports.executeAction = function(name, callback) {
		executeAction(name, function(error, response){
			if (!error) {
				if(callback) {callback()};
			} else {
				if(callback) {callback('Error executing action')};
			}
		});
	}
	
	
	
// Private




// Devices
	
	function readDevices(successCallback, errorCallback) {
		log('Updating devices local store');
		getFromServer(serverParams.serverPath + '/devices.xml', function(payload){
			parseDevicesXML(payload, successCallback, errorCallback);
		});
	};
	
	function parseDevicesXML(xml, successCallback, errorCallback) {
		log('Parsing devices XML', xml);
		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
			result.devices.device.forEach(function(device){
				var deviceName = device._;
				var deviceXmlPath = device.$.href;
				if (!devices[deviceName]) {
					devices[deviceName] = {
						name: deviceName,
						xmlPath: deviceXmlPath
					}
				}
			});
			successCallback(devices);
		});
		parser.parseString(xml);
	};
	
	function parseDeviceXML(xml, successCallback, errorCallback) {
		log('Parsing device XML');
		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
			var deviceName = result && result.device && result.device.name ? result.device.name : null;
			if (deviceName && devices[deviceName]) {
				for (var key in result.device) {
					if (result.device.hasOwnProperty(key)) {
						var value = stringToType(result.device[key][0]);
						devices[deviceName][key] = value;
					};
				};
				successCallback(devices[deviceName]);
			};
		});
		parser.parseString(xml);
	};



// Variables
	
	function readVariables(successCallback, errorCallback) {
		log('Updating variables local store');
		getFromServer(serverParams.serverPath + '/variables.xml', function(payload){
			parseVariablesXML(payload, successCallback, errorCallback);
		});
	};
	
	
	function parseVariablesXML(xml, successCallback, errorCallback) {
		log('Parsing variables XML');
		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
		    result.variables.variable.forEach(function(variable){
		    	var variableName = variable._;
		    	var varibleXmlPath = variable.$.href;
		    	variables[variableName] = {
			    	name: variableName,
			    	xmlPath: varibleXmlPath
		    	};
		    });
		    successCallback();
		});
		parser.parseString(xml);
	};
	
	function parseVariableXML(xml, successCallback, errorCallback) {
		log('Parsing variable XML');
		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
			var variable = result.variable;
			var name = variable.name;
			if (name && variables[name]) {
				variables[name].id = stringToType(variable.id[0]);
				variables[name].readOnly = stringToType(variable.readOnly[0]);
				variables[name].isFalse = stringToType(variable.isFalse[0]);
				variables[name].value = stringToType(variable.value[0]);
				successCallback(variables[name]);
			};
		});
		parser.parseString(xml);
	};



// Actions

	function readActions(callback) {
		log('Updating actions local store');
		var path = serverParams.serverPath + '/actions.xml'
		getFromServer(path, function(payload) {
			parseActionsXML(xml, function(error, callback){
				//TODO
			});
		});
	}

	function executeAction(action, callback) {
		log('Execute Action: ' + action)

		var path = serverParams.serverPath + '/actions/' + action + '?_method=execute';
		//var path = serverParams.serverPath + '/actions/';
		path = encodeURI(path);
		getFromServer(
			path,
			function(response){
				callback(null, response);
			},
			function(error){
				callback(error);
			}
		)

		// TODO: Check if action exists.
		// readActions(function(){

		// })
	};

	function parseActionsXML(xml, callback) {

	};

	function parseActionXML(xml, callback) {

	}



// Utility
	
	function getFromServer(path, successCallback, errorCallback) {
		log('Getting from server ' + path);
		http.get({
			host: serverParams.host,
			port: serverParams.port,
			path: path
		}, function(res) {
			var payload = '';
			res.on("data", function(chunk) {
				payload += chunk;
			});
			res.on("end", function() {
				if (successCallback) {
					successCallback(payload);
				} else {
					log("Got response: " + res.statusCode);
				};
			});
		}).on('error', function(e) {
			if (errorCallback) {
				errorCallback(e);
			} else {
				log("Got error: " + e.message);
			};
		});
	};
	
	// TODO: Create dates, null, undefined, etc.  Just booleans for now. -KCJ
	function stringToType(string) {
		switch (string) {
			case 'true':
			case 'True':
				return true;
				break;
			case 'false':
			case 'False':
				return false;
				break;
			default:
				return string;
		}
	}

	function log(message) {
		console.log(message);	
	};
	
}());