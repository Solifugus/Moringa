#!/usr/bin/node 

var {Moringa} = require('./moringa.js');
var agent = new Moringa( reception );

// Import Moringa Script
let script = 'recognizer "hello"\noption\nsay "How are you?"\n';
agent.importFoundation( script, 'Cybernetic Cynthia' );

// Send message to agent and route response to reception
agent.input('Hello');

// Function to Receive Agent Output (callback and/or manual)
function reception(message) {
	console.log('Agent: ' + message);
}


