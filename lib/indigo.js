(function () {
	 'use strict';
	 
	var http = require('http');
	var xml2js = require('xml2js');
	var serverParams;
	var variables;
	
	exports.connectServer = function(params) {
		serverParams = {};
		variables = {};
		serverParams.host = params.host || 'localhost';
		serverParams.port = params.port || '8176';
		serverParams.serverPath = params.serverPath || '';
	};
	
	exports.setVariable = function(name, value, successCallback, errorCallback) {
		console.log('Setting Indigo variable: ' + name + ' to: ' + value);
		
		readVariables(function(){
			if (!variables[name]) {
				console.log('Variable does not exist on server');
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
		console.log('Getting Indigo variable: ' + name);
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
				console.log('Variable does not exist on server');
			}
		};
	};
	
	exports.getDevices = function(successCallback, errorCallback) {
		// TODO: Return array of devices
	};
	
	exports.getDevice = function(name, successCallback, errorCallback) {
		// TODO: Return info on a device
	};
	
	function readVariables(successCallback, errorCallback) {
		console.log('Updating variables local store');
		getFromServer('/variables.xml', function(payload){
			parseVariablesXML(payload, successCallback, errorCallback);
		});
	};
	
	
	function parseVariablesXML(xml, successCallback, errorCallback) {
		console.log('Parsing variables XML');
		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
		    if (result.variables.variable && result.variables.variable.length > 0) {
			    result.variables.variable.forEach(function(variable){
			    	var variableName = variable._;
			    	variables[variableName] = {
				    	name: variableName,
				    	xmlPath: variable.$.href
			    	}
			    });
			    successCallback();
		    }
		});
		parser.parseString(xml);
	};
	
	function parseVariableXML(xml, successCallback, errorCallback) {
		console.log('Parsing variable XML');
		var parser = new xml2js.Parser();
		parser.addListener('end', function(result) {
			var variable = result.variable;
			var name = variable.name;
			if (name && variables[name]) {
				variables[name].id = variable.id[0];
				variables[name].readOnly = variable.readOnly[0];
				variables[name].isFalse = variable.isFalse[0];
				variables[name].value = variable.value[0];
				successCallback(variables[name]);
			};
		});
		parser.parseString(xml);
	};
	
	function getFromServer(path, successCallback, errorCallback) {
		console.log('Getting from server ' + path);
		http.get({
			host: serverParams.host,
			port: serverParams.port,
			path: serverParams.serverPath + path
		}, function(res) {
			var payload = '';
			res.on("data", function(chunk) {
				payload += chunk;
			});
			res.on("end", function() {				
				if (successCallback) {
					successCallback(payload);
				} else {
					console.log("Got response: " + res.statusCode);
				};
			});
		}).on('error', function(e) {
			if (errorCallback) {
				errorCallback(e);
			} else {
				console.log("Got error: " + e.message);
			};
		});
	};
	
}());