// Moringa Agent Engine Version 1.0
// Copyright (C) 2018 By Matthew C. Tedder
// All Rights Reserved

var tokenizer = require('retokenizer');

class Moringa {
	//constructor( callback, name = 'myself', script = '' ) {
	constructor( callback, name = 'myself', script = '' ) {
		this.callback    = callback;  // where to send interjections
		this.name        = name;      // name of base personality 
		this.personality = {};        // per personality, an array of contexts; a context holds an array of recognizers; holding array of options; holding array of actions 

		if( script !== '' ) this.importFoundation( script, name );
	}

	importFoundation( script, name = this.name ) {
		this.personality[name] = {  // each personality is named
			memories:[],            // each, e.g. { context:'base', memory:'the sky is blue' }
			contexts:[]             // each, e.g. { name:'base', recognizers:[], active:true }
		};
		this.personality[name].contexts.push({
				name:'base',     // base context of personality (interpreted after any other active context(s))
				recognizers:[],  // context's recognizers
				active:true
		});
		this.importSupplement( script, name );
	}

	importSupplement( script, name ) {
		if( this.personality[name] === undefined ) return 'Failure: Specified foundation "' + name + '" could not be supplemented because it does not exist.'; 
		var personality = this.personality[name];   // each personality comprises an array of contexts 
		var context     = personality.contexts[0];  // base context of personality 

		// MoringaScript Syntax Lexicon
		var syntax = {
			splitters:[
				' ','\t','\n','--',
				'recognizer','fallback','nonexclusive','option','always','if',
				'<>','>=','<=','>','<','=','(',')','and','or','not','+','-',
				'synonym','group',':',',','conjugate','retain',
				'say','remember','recall','forget','interpret','expect','as',
				'enter','exit','context',
				'in','at','years','months','weeks','days','hours','minutes','seconds'
			],
			removes:[' ','\t'],
			enclosures:[{ opener:'"', escaper:'\\', closer:'"' }]
		};

		let tokens = tokenizer( script, syntax, true );
		var i = 0;
		//console.log( JSON.stringify( tokens, null, '  ' ) );
		
		// Begin with assumption we are in global recognizer's global option
		var recognizer = { pattern:'', matchers:[], options:[], actions:[] };
		var option     = recognizer;  // to collect recognizer's always actions
		context.recognizers.push(recognizer);

		var commands = [
			{ command:'comment',     gram:'-- * \n',                                    param:{ message:1 }                        },  // useful to export
			{ command:'context',     gram:'context " * " ?:',                           param:{ context:2 }                        },
			{ command:'recognizer',  gram:'recognizer " * " ?:',                        param:{ pattern:2 }                        },
			{ command:'alwaysif',    gram:'?nonexclusive always if ?: * \n',            param:{}                                   },  // use logic to find params 
			{ command:'optionif',    gram:'?fallback ?nonexclusive option if ?: * \n',  param:{}                                   },  // use logic to find params 
			{ command:'option',      gram:'?fallback ?nonexclusive option ?:',          param:{}                                   }, 
			{ command:'synonym',     gram:'synonym * : * ?timing\n',                    param:{ keyword:1, alternates:2, timing:3} },
			{ command:'group',       gram:'group * : * ?timing \n',                     param:{ keyword:1, alternates:2, timing:3} },
			{ command:'conjugate',   gram:'conjugate * \n',                             param:{ transforms:1 }                     }, 
			{ command:'invert',      gram:'invert * \n',                                param:{ transforms:1 }                     }, 
			{ command:'retain',      gram:'retain * ?timing \n',                        param:{ variable:1, timing:2 }             },
			{ command:'say',         gram:'say " * " ?timing \n',                       param:{ message:2, timing:4 }              },
			{ command:'remember',    gram:'remember " * " ?timing \n',                  param:{ message:2, timing:4 }              },
			{ command:'recall',      gram:'recall " * " ?timing\n',                     param:{ message:2, timing:4 }              },
			{ command:'forget',      gram:'forget " * " ?timing \n',                    param:{ message:2, timing:4 }              },
			{ command:'interpretas', gram:'interpret as " * " ?timing \n',              param:{ statement:3, timing:5 }            },
			{ command:'expectas',    gram:'expect " * " as " * " ?timing \n',           param:{ expecting:2, as:6, timing:8 }      },
			{ command:'enter',       gram:'enter " * " ?timing \n',                     param:{ context:2 }                        },
			{ command:'exit',        gram:'exit " * " ?timing \n',                      param:{ context:2 }                        },
			{ command:'blankspace',  gram:'\n',                                         param:{}                                   }
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
				for( var w = 0; w < gram.length; w += 1 ) {
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
						tt += 1;
						continue;
					}

					// Was No Match -- Error
					matched = false;
					break;
				} // end of gram loop (w)
				if( matched ) {
					// Consolidate what was found
					found = { command:cmd.command, begins:t, ends:tt-1, tokens:tokens.slice(t,tt-1), param:{} };

					// Isolate found parameters -- NOTE: positions can change if preceded by ?optionals; undefine check is for ?timings 
					for( var param in cmd.param ) {
						let position = cmd.param[param];
						if( found.tokens[position] !== undefined ) found.param[param] = found.tokens[position].value;	
					}
					break;
				}
				if( found !== undefined ) break;
			} // end of commands loop (c)

			// Grammar Unrecognized
			if( found === undefined ) {
				err = 'Malformed Statement at ' + JSON.stringify(tokens[t].value) + ', line ' + ( tokens[t].lineNo + 1 ) + '.';
				break;
			}
			
			// ----------------------
			// Grammar was Recognized
			// General Philosophy of Directives: push empty new one, populate.. when all done, prune any empty
			//console.log('FOUND: ' + JSON.stringify(found));
			switch( found.command ) {
				// Things to ignore..
				case 'blankspace':
					break;

				// Architectural Commands
				case 'context':
					context = {name:found.tokens[2].value, recognizers:[], memories:[], active:false}; 
					recognizer = { pattern:'', matchers:[], options:[], actions:[] };  // context's global always recognizer 
					option     = recognizer;                                           // to collect recognizer's always actions
					context.recognizers.push(recognizer);
					personality.contexts.push(context);
					break;

				case 'recognizer':
					let matchers = this.formatRecognizerPattern(found.param.pattern);  // translate to format for matching
					recognizer = { pattern:found.param.pattern, matchers:matchers, options:[], actions:[] };
					option     = recognizer;  // to collect recognizer's always actions 
					context.recognizers.push(recognizer);
					break;

				case 'option':
					let fallback     = (found.tokens.length > 1 && (found.tokens[0].value === 'fallback' || found.tokens[1].value === 'nonexclusive')) ? true : false;
					let nonexclusive = (found.tokens.length > 1 && (found.tokens[0].value === 'nonexclusive' || found.tokens[1].value === 'nonexclusive')) ? true : false;
					option           = {condition:'',fallback:fallback,nonexclusive:nonexclusive,actions:[]};
					recognizer.options.push(option);
					break;

				// Action Commands 
				default:
					//console.log('Known but unsupported command "' + found.command + '".');
					let action = { command:found.command, param:found.param, lineNo:found.tokens[0].lineNo };
					option.actions.push(action);
			}

			// Advance in code to continue with next token
			//console.log('Next token will be ' + tt + ' (' + JSON.stringify(tokens[tt].value) + ')');
			t = tt; 
			
		} // end of tokens loop
		if( err !== '' ) console.log( err );
		
		// For each context, sort from longest to shortest..
		for( var c = 0; c < personality.contexts.length; c += 1 ) {
			var context = personality.contexts[c];
			context.recognizers.sort(( a, b ) => { return b.matchers.length - a.matchers.length });
		}
	} // end of importSupplement()

	// Translate string recognizer pattern to matchable version
	formatRecognizerPattern( string ) {
		// Tokenize recognizer pattern
		let syntax = {
			splitters:[' ','\t','\n','~','`','!','@','#','$','%','^','&','*','(',')','-','+','_','=','{','}','[',']',':',';','"','\'','<','>',',','.','?','/','|','\\'],
			removes:[' ','\t','\n'],
			enclosures:[{opener:'[',escaper:'\\',closer:']'}], // [abc] = variable "abc"; [abc:barf] variable "abc" if any value in the "barf" group
			enclosures:[{opener:'`',escaper:'\\',closer:'`'}]  // litteral text, precisely character by charactet
		}
		let matchers = tokenizer( string, syntax, false );
		
		// Make variables a single token
		for( let i = 0; i < matchers.length; i += 1 ) {
			if( matchers[i] === '[' && matchers[i+2] === ']' ) matchers.splice(i,3,'['+matchers[i+1]+']');
		}
		return matchers;
	}

	exportScript( name = this.name, includeModels = true ) {
		// TODO
	}

	/* XXX
      For each active context:
        - Perform Always Actions (each begins with nonexclusvie always actions)
        - Collect Valid Options
        - On first matching recognizer:
          - Perform Always Actions
          - Collect Valid Options
     */
	input( message, name = this.name, callback = this.callback ) {
		let personality = this.personality[name];
		let awareness   = this.interpret( message, personality );
		let preferred   = this.preferredOption( awareness, personality );
		this.performActions( preferred.actions, awareness.variable, personality );
		callback('todo response');
	}

	// Returns Awareness from Recogition and Deducations
	interpret( message, personality ) {
		// Variable to collecting options and related data in; search stops when recognizer is matched
		var awareness = {
			recognizer:false,  // recognizer matched (else undefined)
			variable:{},       // variables collected
			options:[],        // valid options collected
		};

		// For each context..
		for( var c = 0; c < personality.contexts.length; c += 1 ) {
			// For each recognizer..
			for( var r = 0; r < personality.contexts[c].recognizers.length; r += 1 ) {
				var recognizer = personality.contexts[c].recognizers[r];

				// If the context's always recognizer.. 
				if( recognizer.pattern === '' ) {
					// Perform always actions
					this.performActions( recognizer.actions, awareness.variable, personality );
					// Collect valid options
					for( var i = 0; i < recognizer.options.length; i += 1 ) {
						if( this.isOptionValid( option, personality ) ) awareness.options.push(recognizer.options[i]);
					}
					continue;
				}

				// If recognizer is matched, collect all its options then stop collecting.
				let variable = this.matchRecognizer( message, recognizer.matchers, personality );
				if( variable !== false ) {
					awareness.recognizer = recognizer.pattern;
					this.performActions( recognizer.actions, awareness.variable, personality );  // perform recognized's always actions
					for( var name in variable )                             awareness.variable[name] = variable[name];
					for( var i = 0; i < recognizer.options.length; i += 1 ) awareness.options.push(recognizer.options[i]);
					break;
				}
			} // end of recognizers (r) for loop
			if( awareness.recognizer !== false ) break;
			
		} // end of context (c) for loop

		return awareness;
	}

	// Returns false else object of collected variables
	matchRecognizer( message, matchers, personality ) {
		// Tokenize input message
		let syntax = {	
			splitters:[' ','\t','\n','~','`','!','@','#','$','%','^','&','*','(',')','-','+','_','=','{','}','[',']',':',';','"','\'','<','>',',','.','?','/','|','\\'],
			removes:['\t','\n']
		}
		let actuals = tokenizer( message, syntax, false );

		// Check how many matchers in actuals (message tokens), in order.. 
		var m        = 0;
		var a        = 0;
		var variable = {};
		var betweens = '';
		for( a = 0; a < actuals.length; a += 1 ) {
			if( !( m < matchers.length ) ) break;
			var matcher = matchers[m];
			// If variable..
			if( matcher[0] === '[' && matcher[matcher.length-1] === ']' ) {
				// Capture variable until next matcher or end of actuals (of no more matchers)
				var name  = matchers[m].substr(1,matchers[m].length-2);
				var value = '';
				m += 1;
				while( a < actuals.length ) {
					if( matchers[m] !== undefined && actuals[a].toLowerCase() === matchers[m].toLowerCase() ) break;
					value += actuals[a];
					a += 1;
				}
				a -= 1;
				// TODO: validate if variable has group specified
				variable[name] = value.trim();
			} 
			// Else litteral
			else {
				var synonyms = [matcher];
				// TODO: add any synonyms to synonyms
				var matches = false;
				for( var s = 0; s < synonyms.length; s +=1 ) {
					if( synonyms[s].toLowerCase() === actuals[a].toLowerCase() ) { matches = true; break; }
				}
				if( matches ) {
					// Record any relevant implicit variables between matchers
					if( m < matchers.length ) variable['before-' + m] = betweens.trim();
					if( m > 0 ) variable['after-' + (m-1)]            = variable['before-' + m];
					betweens                                          = ''; 

					// Advance to seek next matcher
					m += 1;
				}
				else {
					// Did not match, so store as an implicit "between the matchers" variable..
					betweens += actuals[a];
				}
			}
		} // end of actuals for loop
		for( a = a; a < actuals.length; a += 1 ) betweens += actuals[a];
		variable['after-' + (m-1)] = betweens.trim();

		// This Recognizer Matched, if all matchers were found in input message actuals 
		if( m === matchers.length ) {
			return variable;
		} 
		else { return false; }
	}

	isOptionValid( option, personality ) {
		return true;
	}

	preferredOption( awareness, personality ) {
		// TODO: build in smart algorithms
		var preferred = awareness.options[this.randomBetween(0,awareness.options.length-1)];
		return preferred;
	}

	randomBetween( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) + min );
	}

	performActions( actions, variable, personality ) {
		console.log( 'VARIABLE: ' + JSON.stringify(variable,null,'  ') );
		//console.log( 'ACTIONS: ' + JSON.stringify(actions,null,'  ') );
		for( var a = 0; a < actions.length; a += 1 ) {
			var action = actions[a];
			console.log('ACTION ' + a + ': ' + JSON.stringify(action) );
			switch( action.command.toLowerCase() ) {
				case 'say':      this.actionSay( action.param, variable, personality ); break;	
				case 'remember': this.actionRemember( action.param, variable, personality ); break;	
				case 'recall':   this.actionRecall( action.param, variable, personality ); break;	
			}
		}
	}

	// ========== Action Performances ==========
	actionSay( param, variable, personality ) {
		console.log( param.message );
	}

	actionRemember( param, variable, personality ) {
		// TODO: format output pattern
		personality.memories.push( { context:'base', memory:param.message } );
	}

	actionRecall( param, variable, personality ) {
		var matchers = this.formatRecognizerPattern(param.message);
		for( var m = 0; m < personality.memories.length; m += 1 ) {
			var memory = personality.memories[m].memory;
			found = this.matchRecognizer( matchers, memory, personality );
			if( found !== false ) {
				for( var name in found ) {
					if( variable[name] !== undefined ) { variable[name] += ', ' + found[name]; }
					else                               { variable[name] = found[name]; }
				}
			}
		}
	}

} // End of class

exports.Moringa = Moringa;
