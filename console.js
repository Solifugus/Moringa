#! env node

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
		if( statement.toLowerCase() === 'trace clear' ) {
			agent.traces = [];
			console.log('(Tracing For: nothing)');
			return;
		}
		if( statement.substr(1,5) === 'trace' ) {
			var options = statement.substr(6).split(' ');
			var toggle = options.pop().trim().toLowerCase();
			if( toggle !== 'on' && toggle !== 'off' ) {
				options.push(toggle);
				toggle = 'on';
			}
			for( var i = 0; i < options.length; i += 1 ) { 
				var option = options[i].trim().toLowerCase();
				if( option === '' ) continue;
				if( toggle === 'on' ) {
					if( agent.traces.indexOf(option) === -1 ) agent.traces.push(option);
				}
				else {
					if( agent.traces.indexOf(option) !== -1 ) agent.traces.splice( agent.traces.indexOf(option), 1 );
				}
			}
			console.log('(Tracing For: ' + JSON.stringify(agent.traces) + ')');
			return;
		}
		switch(statement.substr(1).toLowerCase()) {
			case 'memory':
				for( var i = 0; i < agent.model.synthia.memories.length; i += 1 ) {
					let memory = agent.model.synthia.memories[i];
					console.log( memory.context + ': ' + memory.memory );
				}
				break;
			case 'expects':
				console.log( JSON.stringify(agent.model.synthia.expects, null, '  ') );
				break;
			case 'recognizers':
				for( var c = 0; c < agent.model.synthia.contexts.length; c += 1 ) {
					var context = agent.model.synthia.contexts[c];
					for( var r = 0; r < context.recognizers.length; r += 1 ) {
						console.log('C' + c + 'R' + r + ': ' + JSON.stringify(context.recognizers[r].pattern));
					}
				}
				break;
		}
	}
	else {
		console.log( 'User: ' + statement );
		agent.input( statement, 'synthia' );
		//console.log( 'XXX' + JSON.stringify( agent.logEntries, null, '  ' ) );
		while( agent.logEntries.length > 0 ) console.log( '==> ' + agent.logEntries.shift() );
	}
  });

function reception( message ) {
	console.log( 'Agent: ' + message );
	//process.stdout.write("User: ");
}
