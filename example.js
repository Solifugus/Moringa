#!/usr/bin/node 

var fs = require('fs');
var {Moringa} = require('./moringa.js');
var agent = new Moringa( reception, 'synthia' );

// Import Moringa Script
console.log('\nStarting Cybernetic Synthia..');
console.log('=============================');
let script = fs.readFileSync('./synthia.pgm').toString();

agent.importFoundation( script, 'synthia' );

// Send message to agent and route response to reception
//agent.input('I only want to say hello, my friend','synthia');
//agent.input('My name is Jason.','synthia');

// Test Cases
var tests = [
	{ type:'A', message:'Hello.' },
	{ type:'A', message:'My name is Joe.' },
	{ type:'A', message:'Joe likes to dance on friday afternoons.' },
	{ type:'A', message:'Mike loves to wrestle on saturday afternoons.' },
	{ type:'A', message:'Being female makes me feel good.' },
];

for( var t = 0; t < tests.length; t += 1 ) {
	console.log( '\nUser: ' + tests[t].message );
	agent.input( tests[t].message, 'synthia' ); 
}

// Function to Receive Agent Output (callback and/or manual)
function reception(message) {
	console.log('Agent: ' + message);
}


