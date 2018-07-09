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
	//{ type:'A', message:'Hello.' },
	//{ type:'A', message:'My name is Joe.' },
	
	// Timings
	//{ type:'T', message:'recite poetry' },
	//{ type:'T', message:'In 15 seconds tell me the timer is working.' },
	//{ type:'T', message:'Slap me in 3 seconds.' },
	//{ type:'T', message:'In 2 seconds, remind me that 2 seconds have passed.' },
	
	// Value arrays
	//{ type:'V', message:'I like bananas' },
	//{ type:'V', message:'I like apples' },
	//{ type:'V', message:'I like oranges' },
	//{ type:'V', message:'What do you think of bananas?' },
	
	// Interpret As
	{ type:'I', message:'A kitten is something I like.' },
	//{ type:'A', message:'What kinds of food do I like to eat?' },
	//{ type:'A', message:'I was a sgt in the Army.' },
	//{ type:'A', message:'I like to twidle my thumbs.' },
];

for( var t = 0; t < tests.length; t += 1 ) {
	console.log( '\nUser: ' + tests[t].message );
	agent.input( tests[t].message, 'synthia' ); 
}

// Function to Receive Agent Output (callback and/or manual)
function reception(message) {
	console.log('Agent: ' + message);
}


