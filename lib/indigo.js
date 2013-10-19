(function () {
	 'use strict';
	 
	var http = require('http');
	var expat = require('node-expat');
	var serverParams;
	var variables;
	
	exports.connectServer = function(params) {
		serverParams = {};
		variables = {};
		serverParams.host = params.host || 'localhost';
		serverParams.port = params.port || '8176';
		serverParams.serverPath = params.serverPath || '/';
		serverParams.variablesPath = params.variablesPath || 'variables/';
	};
	
	exports.setVariable = function(name, value, successCallback, errorCallback) {
		console.log('Setting Indigo variable: ' + name + ' to: ' + value);
		
		readVariables(function(){
			if (!variables[name]) {
				console.log('Variable does not exist on server');
				return false;
			}
			
			http.get({
				host: serverParams.host,
				port: serverParams.port,
				path: serverParams.serverPath + serverParams.variablesPath + name + '?_method=put&value=' + value
			}, function(res) {
				if (successCallback) {
					successCallback(res);
				} else {
					console.log("Got response: " + res.statusCode);
				};
			}).on('error', function(e) {
				if (errorCallback) {
					errorCallback(e);
				} else {
					console.log("Got error: " + e.message);
				};
			});
		});
	};
	
	exports.getVariable = function() {
		console.log("getVariable not implemented yet");
	};
	
	function readVariables(successCallback, errorCallback) {
		console.log('Updating variables local store');

		http.get({
			host: serverParams.host,
			port: serverParams.port,
			path: serverParams.serverPath + 'variables.xml'
		}, function(res) {
			res.on("data", function(payload) {
				parseVariablesXML(payload, successCallback);
			 });
		}).on('error', function(e) {
			console.log("Got error: " + e.message);
		});
	};
	
	
	function parseVariablesXML(xml, successCallback, errorCallback) {	
		var parser = new expat.Parser("UTF-8");
		var variablesArray = [];
		var nodeIsVariable = false;
		parser.addListener('startElement', function(name, attrs) {
			if (name === 'variable') {
				variablesArray.push({
					href: attrs.href
				});
				nodeIsVariable = true;
			};
		});
		parser.addListener('text', function(contents) {
			if (nodeIsVariable) {
				variablesArray[variablesArray.length - 1].name = contents;
			}
		});
		parser.addListener('endElement', function(name) {
			nodeIsVariable = false;
		});
		parser.parse(xml);
		variablesArray.forEach(function(variable){
			if (!variables[variable.name]) {variables[variable.name] = variable};
		});
		successCallback();
	};
	
	function parseVariableXML(xml) {
		var parser = new expat.Parser("UTF-8");
	};
	
}());