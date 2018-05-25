// Moringa Agent Engine Version 1.0
// Copyright (C) 2018 By Matthew C. Tedder
// All Rights Reserved

var tokenizer = require('retokenizer');

class Moringa {
	//constructor( callback, name = 'myself', script = 'Recognizer "[anything]"\nSay "I am brainless"\n' ) {
	constructor( callback, name = 'myself', script = '' ) {
		this.callback    = callback;  // where to send interjections
		this.name        = name;      // name of base personality 
		this.personality = {};        // per personality, an array of contexts; a context holds an array of recognizers; holding array of options; holding array of actions 

		if( script !== '' ) this.importFoundation( script, name );
	}

	importFoundation( script, name = 'Foundation' ) {
		this.personality[name] = [];
		this.personality[name].push({
				name:'base',     // base context of personality (interpreted after any other active context(s))
				recognizers:[],  // context's recognizers
				memories:[],     // context's memories
				active:true
		});
		this.importSupplement( name, script );
	}

	importSupplement( name, script ) {
		if( this.personality[name] === undefined ) return 'Failure: Specified foundation "' + name + '" could not be supplemented because it does not exist.'; 
		var personality = this.personality[name];   // each personality comprises an array of contexts 
		var context     = personality[0];           // base context of personality 

		// MoringaScript Syntax Lexicon
		var syntax = {
			splitters:[
				' ','\t','\n','--',
				'recognizer','last','exclusive','option',
				'<>','>=','<=','>','<','=','(',')','and','or','not','+','-',
				'synonym','group',':',',','conjugate','maintain',
				'say','remember','recall','forget','interpret','expect','as','request',
				'enter','exit','context','{','}',
				'in','at','years','months','weeks','days','hours','minutes','seconds'
			],
			removes:[' ','\t'],
			enclosures:[
				{ opener:'"', escaper:'\\', closer:'"' },
				{ opener:'[', escaper:'\\', closer:']' }
			]
		};

		let tokens = tokenizer( script, syntax, true );
		var i = 0;
		//console.log( JSON.stringify( tokens, null, '  ' ) );
		
		/* Compile statements 
		// recognizers[
		 	{
		 	pattern:'',
		 	priority:0,
		 	options:[
		 		{
		 			last:false,
		 			exclusive:false,
		 			condition:'',
		 			actions:[]
		 		},..
		 		]
		 	},..
		 	]
		*/
		// Begin with assumption we are in global recognizer's global option
		var recognizer = { pattern:'', priority:0, options:[] };                     // always executed and always first (per interaction)
		var option     = { last:false, exclusive:false, condition:'', actions:[] };  // always executed and always first (per option)

		var commands = [
			{ command:'comment',     gram:'-- * \n'                          },
			{ command:'context',     gram:'context " * " \n'                 },
			{ command:'recognizer',  gram:'recognizer " * " \n'              },
			{ command:'optionif',    gram:'?last ?exclusive option if * \n'  },
			{ command:'option',      gram:'?last ?exclusive option \n'       },
			{ command:'synonym',     gram:'synonym * : * ?timing\n'          },
			{ command:'group',       gram:'group * : * ?timing \n'           },
			{ command:'conjugate',   gram:'conjugate \n'                     },
			{ command:'maintain',    gram:'maintain * ?timing \n'            },
			{ command:'say',         gram:'say " * " ?timing \n'             },
			{ command:'remember',    gram:'remember " * " ?timing \n'        },
			{ command:'recall',      gram:'recall " * " ?timing\n'           },
			{ command:'forget',      gram:'forget ?timing \n'                },
			{ command:'interpretas', gram:'interpret as "*" ?timing \n'      },
			{ command:'expectas',    gram:'expect " * " as " * " ?timing \n' },
			{ command:'request',     gram:'request " * " ?timing \n'         },
			{ command:'enter',       gram:'enter " * "'                      },
			{ command:'exit',        gram:'exit " * " \n'                    },
			{ command:'blankspace',  gram:'\n'                               }
		];

		// Loop through Code Tokens
		var err = '';
		var t   = 0;
		while( t < tokens.length ) {
			// Loop through Grammars to Find Matches or Identify Errors
			var found = undefined;
			for( var c = 0; c < commands.length; c += 1 ) {
				var cmd  = commands[c];
				var gram = cmd.gram.split(' ');  // command grammars are defined space-separated ("?" prefixes optionals; "timings" is a sub-grammar)
				var matched = true;              // If a recognized command actually found
				var tt          = t;             // Searching for command starting at t and ending at tt
				//console.log('LOOKING for whatever command starts at token ' + t + ' (' + JSON.stringify(tokens[t]) + ')');
				//console.log('Checking if command grammar "' + JSON.stringify(gram) + '" is at token position ' + tt);
				for( var w = 0; w < gram.length; w += 1 ) {
					//console.log('\tSeeking ' + JSON.stringify(gram[w]) + ' at position ' + tt + ' (' + JSON.stringify(tokens[tt]) + ')..');
					// Match Wildcard Regardless
					if( gram[w] === '*' ) {
						//console.log( '\t- ' + JSON.stringify(gram[w]) + ' matches wildcard' );
						tt += 1;
						continue;
					}

					// Match ?Option (but if not, continue without advancing tt because this was only optional)
					if( gram[w][0] === '?' ) {
						// Is timing specification--check special sub-grammar
						if( gram[w].substr(1).toLowerCase() === 'timings' ) {
							tt += 1;
							continue;
						}
						else {
							if( gram[w].substr(1).toLowerCase() === tokens[tt].value.toLowerCase() ) {
								//console.log( '\t- ' + JSON.stringify(gram[w]) + ' matches optional' );
								tt += 1;
								continue;
							}
							continue;
						}
					}

					// Is Litteral Match?
					if( gram[w].toLowerCase() === tokens[tt].value.toLowerCase() ) {
						//console.log( '\t- ' + JSON.stringify(gram[w]) + ' matches litteral at position ' + tt + ' (just before ' + JSON.stringify(tokens[tt+1].value) + ' at position ' + (tt+1) + ')' );
						tt += 1;
						continue;
					}

					// Was No Match -- Error
					//console.log('\tCommand did not match..');
					matched = false;
					break;
				} // end of gram loop (w)
				if( matched ) {
					found = { command:cmd.command, begins:t, ends:tt-1, tokens:tokens.slice(t,tt-1) };
					//console.log('found: ' + JSON.stringify(found.command,null,'  '));
					break;
				}
				if( found !== undefined ) break;
			} // end of commands loop (c)

			// Grammar Unrecognized
			if( found === undefined ) {
				err = 'Malformed Statement at ' + JSON.stringify(tokens[t].value) + ', line ' + tokens[t].lineNo + '.';
				break;
			}
			
			// ----------------------
			// Grammar was Recognized
			// General Philosophy of Directives: push empty new one, populate.. when all done, prune any empty
			//console.log('FOUND: ' + JSON.stringify(found));
			switch( found.command ) {
				case 'blankspace':
					break;

				case 'context':
					context = {name:found.tokens[2].value, recognizers:[], memories:[], active:false}; 
					personality.push(context);
					break;

				case 'recognizer':
					recognizer = {pattern:found.tokens[2].value,priority:0,options:[]};
					context.recognizers.push(recognizer);
					break;

				case 'option':
					let last      = (found.tokens.length > 1 && (found.tokens[0].value === 'last' || found.tokens[1].value === 'exclusive')) ? true : false;
					let exclusive = (found.tokens.length > 1 && (found.tokens[0].value === 'exclusive' || found.tokens[1].value === 'exclusive')) ? true : false;
					option        = {condition:null,last:last,exclusive:exclusive,actions:[]};
					recognizer.options.push(option);
					break;

				// TODO: case for each command
				case 'say':
					break;

				default:
					console.log('Known but unsupported command "' + found.command + '".');
			}

			// Advance in code to continue with next token
			//console.log('Next token will be ' + tt + ' (' + JSON.stringify(tokens[tt].value) + ')');
			t = tt; 
			
		} // end of tokens loop
		if( err !== '' ) console.log( err );
		
	} // end of importSupplement()

	exportScript( name = this.name, includeModels = true ) {
		// TODO
	}

	input( message, name = this.name, callback = this.callback ) {
		console.log('PERSONALITIES:\n' + JSON.stringify(this.personality,null,'  '));
		//let options = this.getOptions( message, this.personality[name] );
		//let option  = this.getPreferred(options, this.personality[name] );
		//this.execute( option, this.personality[name] );
	}

	getOptions( message, personality ) {
		//var options = [];
		//for( var c = 0; c < personality.length; c += 1 ) {
			
		//}
	}

	getPreferred( options, personality ) {
	}

	execute( option, personality ) {
	}
}

exports.Moringa = Moringa;
