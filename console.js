#!/usr/bin/node

if( process.argv.length < 3 ) {
	console.error('One or more script files are required.');
	return;
}

var fs = require('fs');
var {Moringa} = require('./moringa.js');
var agent = new Moringa( reception, 'synthia' );

for( var f = 2; f < process.argv.length; f += 1 ) {
	let script = fs.readFileSync( process.argv[f] ).toString();
	console.log('Importing ' + process.argv[f] + '..');
	agent.importFoundation( script, 'synthia' );
}

console.log('\nStarting Cybernetic Synthia..');
console.log('=============================');

// Setup Listener for User Input
var stdin = process.openStdin();

stdin.addListener("data", function( received ) {
	let statement = received.toString().trim();
	if( statement[0] === '/' ) {
		switch(statement.substr(1).toLowerCase()) {
			case 'memory':
				console.log( JSON.stringify(agent.model.synthia.memories, null, '  ') );
				break;
			case 'expects':
				console.log( JSON.stringify(agent.model.synthia.expects, null, '  ') );
				break;
		}
	}
	else {
		console.log( 'User: ' + statement );
		agent.input( statement, 'synthia' );
	}
  });

function reception( message ) {
	console.log( 'Agent: ' + message );
	//process.stdout.write("User: ");
}
