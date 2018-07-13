#!/usr/bin/node
var fs = require('fs');
var {Moringa} = require('./moringa.js');
var agent = new Moringa( reception, 'synthia' );

console.log('\nStarting Cybernetic Synthia..');
console.log('=============================');
let script = fs.readFileSync('./synthia.pgm').toString();

agent.importFoundation( script, 'synthia' );

// Setup Listener for User Input
var stdin = process.openStdin();

stdin.addListener("data", function( received ) {
	let statement = received.toString().trim();
	console.log( 'User: ' + statement );
	agent.input( statement, 'synthia' );
  });

function reception( message ) {
	console.log( 'Agent: ' + message );
	//process.stdout.write("User: ");
}
