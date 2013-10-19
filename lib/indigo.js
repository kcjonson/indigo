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
			var path = serverParams.variablesPath + name + '?_method=put&value=' + value;
			getFromServer(path, function(){
				// TODO Verify if set correctly
				if (successCallback) {successCallback()};
			}, errorCallback);
		});
	};
	
	exports.getVariable = function(name, successCallback, errorCallback) {
		console.log('Getting Indigo variable: ' + name);
		checkAndProceed(true);		
		function checkAndProceed(read) {
			if (variables[name]) {
				getFromServer(variables[name].path, function(payload){
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
	
	function readVariables(successCallback, errorCallback) {
		console.log('Updating variables local store');
		getFromServer('variables.xml', function(payload){
			parseVariablesXML(payload, successCallback, errorCallback);
		});
	};
	
	
	function parseVariablesXML(xml, successCallback, errorCallback) {	
		var parser = new expat.Parser("UTF-8");
		var variablesArray = [];
		var nodeIsVariable = false;
		parser.addListener('startElement', function(name, attrs) {
			if (name === 'variable') {
				variablesArray.push({
					path: serverParams.variablesPath + attrs.href
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
		
		// WORK IN PROGRESS, XML Parsing is hard -KJ
		
/*
		parser.addListener('startElement', function(name, attrs) {
			console.log('start', name, attrs);
		});
		parser.addListener('text', function(contents) {
			console.log('text', contents);
		});
		parser.addListener('endElement', function(name) {
			console.log('end', name);
		});
*/
		parser.parse(xml);
	};
	
	function getFromServer(path, successCallback, errorCallback) {
		http.get({
			host: serverParams.host,
			port: serverParams.port,
			path: serverParams.serverPath + path
		}, function(res) {
			res.on("data", function(payload) {
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