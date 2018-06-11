// Moringa Agent Engine Version 1.0
// Copyright (C) 2018 By Matthew C. Tedder
// All Rights Reserved
//
// TO DO ITEMS:
// 	[ ] Condition Evaluations
// 	[ ] Inversions -- If before or after a litteral or group, do not match
// 	[ ] Decision logic
// 	[ ] Seekers and Avoiders
// 	[ ] Inter-Personality

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
			contexts:[],            // each, e.g. { name:'general', recognizers:[], active:true }
			memories:[],            // each, e.g. { context:'general', memory:'the sky is blue' }
			conjugations:[],        // each, e.g. { context:'general', from:'me', to:'you' }
			synonyms:[],            // each, e.g. { context:'general', keyword:'yes', members:['yeah','yep','yup','sure'] }
			groups:[],              // each, e.g. { context:'general', keyword:'gender', members:['male','female'] }
			expectations:[],        // each, e.g. { context:'general', expect:'feeling', as:'I am feeling [feeling].' }
			retained:{},            // variable's to retain with values..  
			scheduledActions:[]     // each, e.g., { context:'general', time:0, action:{} } 
		};
		this.personality[name].contexts.push({
				name:'general',  // general context of personality (interpreted after any other active context(s))
				recognizers:[],  // context's recognizers
				active:true
		});
		this.importSupplement( script, name );
	}

	importSupplement( script, name ) {
		if( this.personality[name] === undefined ) return 'Failure: Specified foundation "' + name + '" could not be supplemented because it does not exist.'; 
		var personality = this.personality[name];   // each personality comprises an array of contexts 
		var context     = personality.contexts[0];  // general context of personality 

		// MoringaScript Syntax Lexicon
		var syntax = {
			splitters:[
				' ','\t','\n','--',
				'recognizer','fallback','exclusive','additional','option','always','if',
				'synonyms','group',':',',','conjugate','and','retain','invert','on',
				'say','remember','recall','forget','interpret','expect','as',
				'enter','exit','context'
			],
			removes:[' ','\t'],
			enclosures:[
				{ opener:'--', closer:'\n' },
				{ opener:'"', escaper:'\\', closer:'"' },
				{ opener:'if', closer:'\n' },
				{ opener:':', closer:'\n' },
			//	{ opener:'in', closer:'\n' },
			//	{ opener:'at', closer:'\n' },
				{ opener:'for', closer:'\n' }
			]
		};

		let tokens = tokenizer( script, syntax, {rich:true} );
		//console.log( 'TOKENS:\n' + JSON.stringify( tokens, null, '  ' ) + '\n\n' );
		
		// If quote not closed by end of line, make error clear closing quote is missing..
		for( let t = 0; t < tokens.length; t += 1 ) {
			if( tokens[t].type === 'opener' && tokens[t].value === '"' && tokens[t+1] !== undefined && tokens[t+1].value.indexOf('\n') !== -1 ) {
				throw('Syntax Error: quote on line ' + tokens[t].lineNo + ' not closed.');
			}
		}
		
		var i = 0;
		
		// Begin with assumption we are in global recognizer's global option
		var recognizer = { pattern:'', matchers:[], options:[], actions:[] };
		var option     = recognizer;  // to collect recognizer's always actions
		context.recognizers.push(recognizer);

		var commands = [
			{ command:'comment',      gram:'-- * \n',                                          param:{ message:1 }                        },  // useful to export
			{ command:'context',      gram:'context " * "',                                    param:{ context:2 }                        },
			{ command:'recognizer',   gram:'recognizer " * "',                                 param:{ pattern:2 }                        },
			{ command:'alwaysif',     gram:'?exclusive ?additional always if * \n',            param:{}                                   },  // use logic to find params 
			{ command:'optionif',     gram:'?fallback ?exclusive ?additional option if * \n',  param:{}                                   },  // use logic to find params 
			{ command:'option',       gram:'?fallback ?exclusive ?additional option',          param:{}                                   }, 
			{ command:'synonyms',     gram:'synonyms * : * \n',                                param:{ keyword:1, members:3 }             },
			{ command:'group',        gram:'group * : * \n',                                   param:{ keyword:1, members:3 }             },
			{ command:'conjugateand', gram:'conjugate " * " and " * " \n',                     param:{ first:2, second:6 }                }, 
			{ command:'conjugateto',  gram:'conjugate " * " to " * " \n',                      param:{ first:2, second:6 }                }, 
			{ command:'inverton',     gram:'invert on " * " \n',                               param:{ term:3 }                           }, 
			{ command:'retain',       gram:'retain * \n',                                      param:{ variable:1 }                       },
			{ command:'retainfor',    gram:'retain * for * \n',                                param:{ variable:1, timing:3 }             },
			{ command:'say',          gram:'say " * " ?timing \n',                             param:{ message:2, timing:4 }              },
			{ command:'remember',     gram:'remember " * " ?timing \n',                        param:{ message:2, timing:4 }              },
			{ command:'recall',       gram:'recall " * " ?timing\n',                           param:{ message:2, timing:4 }              },
			{ command:'forget',       gram:'forget " * " ?timing \n',                          param:{ message:2, timing:4 }              },
			{ command:'interpretas',  gram:'interpret as " * " ?timing \n',                    param:{ statement:3, timing:5 }            },
			{ command:'expectas',     gram:'expect " * " as " * " ?timing \n',                 param:{ expecting:2, as:6, timing:8 }      },
			{ command:'enter',        gram:'enter " * " ?timing \n',                           param:{ context:2 }                        },
			{ command:'exit',         gram:'exit " * " ?timing \n',                            param:{ context:2 }                        },
			{ command:'seek',         gram:'seek * % * \n',                                    param:{ percent:1, condition:2 }           }, 
			{ command:'avoid',        gram:'avoid * % * \n',                                   param:{ percent:1, condition:2 }           },
			{ command:'newline',      gram:'\n',                                               param:{}                                   }
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
				var wildcardFinish;
				for( var w = 0; w < gram.length; w += 1 ) {
					if( gram[w] === '*' ) {
						// One token matched by wildcard -- because we are assuming it's an enclosure
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
						// If ZZZ
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
			let fallback;
			let exclusive;
			let additional;
			let condition;
			
			switch( found.command ) {
				// Things to ignore..
				case 'newline':
				case 'comment':
					break;

				// Architectural Commands
				case 'context':
					context    = {name:found.tokens[2].value, recognizers:[], memories:[], active:false}; 
					recognizer = { pattern:'', matchers:[], options:[], actions:[] };  // context's global always recognizer 
					option     = recognizer;                                           // to collect recognizer's always actions
					context.recognizers.push(recognizer);
					personality.contexts.push(context);
					break;

				case 'recognizer':
					let matchers = this.formatRecognizerPattern(found.param.pattern);  // translate to format for matching
					recognizer   = { pattern:found.param.pattern, matchers:matchers, options:[], actions:[] };
					option       = recognizer;  // to collect recognizer's always actions 
					context.recognizers.push(recognizer);
					break;

				case 'option':
					fallback   = (found.tokens.length > 1 && (found.tokens[0].value === 'fallback'   || found.tokens[1].value === 'fallback'   || found.tokens[2].value === 'fallback'))   ? true : false;
					exclusive  = (found.tokens.length > 1 && (found.tokens[0].value === 'exclusive'  || found.tokens[1].value === 'exclusive'  || found.tokens[2].value === 'exclusive'))  ? true : false;
					additional = (found.tokens.length > 1 && (found.tokens[0].value === 'additional' || found.tokens[1].value === 'additional' || found.tokens[2].value === 'additional')) ? true : false;
					option       = { condition:'', fallback:fallback, exclusive:exclusive, additional:additional, always:false, actions:[] };
					recognizer.options.push(option);
					break;

				case 'optionif':
					fallback   = (found.tokens.length > 1 && (found.tokens[0].value === 'fallback'   || found.tokens[1].value === 'fallback'   || found.tokens[2].value === 'fallback'))   ? true : false;
					exclusive  = (found.tokens.length > 1 && (found.tokens[0].value === 'exclusive'  || found.tokens[1].value === 'exclusive'  || found.tokens[2].value === 'exclusive'))  ? true : false;
					additional = (found.tokens.length > 1 && (found.tokens[0].value === 'additional' || found.tokens[1].value === 'additional' || found.tokens[2].value === 'additional')) ? true : false;
					condition    = found.tokens[found.tokens.length-2];
					option       = { condition:condition, fallback:fallback, exclusive:exclusive, additional:additional, always:false, actions:[] };
					recognizer.options.push(option);
					break;

				case 'alwaysif':
					fallback   = (found.tokens.length > 1 && (found.tokens[0].value === 'fallback'   || found.tokens[1].value === 'fallback'   || found.tokens[2].value === 'fallback'))   ? true : false;
					exclusive  = (found.tokens.length > 1 && (found.tokens[0].value === 'exclusive'  || found.tokens[1].value === 'exclusive'  || found.tokens[2].value === 'exclusive'))  ? true : false;
					additional = (found.tokens.length > 1 && (found.tokens[0].value === 'additional' || found.tokens[1].value === 'additional' || found.tokens[2].value === 'additional')) ? true : false;
					condition    = found.tokens[found.tokens.length-2];
					option       = { condition:condition, fallback:fallback, exclusive:exclusive, additional:additional, always:true, actions:[] };
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
			context.recognizers.sort(( a, b ) => {
				if( a.pattern === '' ) return -1;  // ensure always recognizer is always first.. 
				return b.matchers.length - a.matchers.length 
			});
		}
	} // end of importSupplement()

	// Translate string recognizer pattern to matchable version
	formatRecognizerPattern( string ) {
		// Tokenize recognizer pattern
		let syntax = {
			splitters:[' ','\t','\n','~','`','!','@','#','$','%','^','&','*','(',')','-','+','_','=','{','}','[',']',':',';','"','\'','<','>',',','.','?','/','|','\\'],
			removes:[' ','\t','\n'],
			enclosures:[
				{opener:'[',closer:']'},              // [abc] = variable "abc"; [abc:barf] variable "abc" if any value in the "barf" group
				{opener:'`',escaper:'\\',closer:'`'}  // litteral text, precisely character by charactet
			]
		}
		let matchers = tokenizer( string, syntax, {rich:false} );
		
		// Make variables a single token
		for( let i = 0; i < matchers.length; i += 1 ) {
			if( matchers[i] === '[' && matchers[i+2] === ']' ) matchers.splice(i,3,'['+matchers[i+1]+']');
		}
		return matchers;
	}

	exportScript( name = this.name, includeModels = true ) {
		// TODO
	}

	// ===== Process an Input Message =====
	input( message, name = this.name, callback = this.callback ) {
		let personality  = this.personality[name];
		let awareness    = this.interpret( message, personality );
		//console.log( 'OPTIONS FOUND: ' + JSON.stringify(awareness.options,null,'  ') );

		let preferred    = this.pickOption( awareness, personality );
		//console.log( JSON.stringify( preferred ) );
		var response     = this.performActions( preferred.actions, awareness, personality );
		callback(response);
	}

	// Returns Awareness from Recogition and Deducations
	interpret( message, personality ) {
		// Variable to collecting options and related data in; search stops when recognizer is matched
		var awareness = {
			recognizer:false,  // recognizer matched (else undefined)
			contextName:'',    // context of matched recognizer
			contextPriority:0, // current order of context, to be interpreted
			variable:{},       // variables collected
			options:[],        // valid options collected
		};

		// For each context..
		for( var c = 0; c < personality.contexts.length; c += 1 ) {
			awareness.contextName = personality.contexts[c].name; 
			awareness.contextPriority = c;
			
			// For each recognizer..
			for( var r = 0; r < personality.contexts[c].recognizers.length; r += 1 ) {
				var recognizer = personality.contexts[c].recognizers[r];

				// If the context's always recognizer.. 
				if( recognizer.pattern === '' ) {
					// Perform always actions
					this.performActions( recognizer.actions, awareness, personality );
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
					this.performActions( recognizer.actions, awareness, personality );  // perform recognized's always actions
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
		let actuals = tokenizer( message, syntax, {rich:false} );

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
					if( matchers[m] !== undefined && this.wordMatches( actuals[a], matchers[m], personality ) ) break;
					value += actuals[a];
					a += 1;
				}
				a -= 1;
				
				value = value.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");  // remove all punctuation and outlaying spaces

				// If variable specifies a group, the value must be a member of that group else not matched..
				if( name.indexOf(':') !== -1 ) {
					let group = name.split(':')[1];
					name      = name.split(':')[0];	
					if( !this.wordInGroup( value, group, personality ) ) { console.log('Actual "" NOT IN GROUP ""');  return false; } 
				}

				// All is well..
				variable[name] = value;
			} 
			// Else litteral
			else {
				if( this.wordMatches( actuals[a], matcher, personality ) ) {
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

	// Does word match matcher or any synonyms thereof?
	wordMatches( word, matcher, personality ) {
		// Collect any synonyms
		var synonyms = [matcher];
		for( let s = 0; s < personality.synonyms.length; s += 1 ) {
			if( personality.synonyms[s].keyword.toLowerCase() === matcher.toLowerCase() ) {
				for( var m = 0; m < personality.synonyms[s].members.length; m += 1 ) synonyms.push( personality.synonyms[s].members[m] );
				break;
			}
		}

		// Check for match against any synonyms, caselessly
		var matches = false;
		for( var s = 0; s < synonyms.length; s +=1 ) {
			if( synonyms[s].toLowerCase() === word.toLowerCase() ) {
				matches = true;
				break;
			}
		}

		return matches;
	}

	// Is word in specified group?  (unlike synonyms, group name itself does not count)
	wordInGroup( word, group, personality ) { 
		// Find specified group's members
		var members;
		for( let g = 0; g < personality.groups.length; g += 1 ) {
			if( personality.groups[g].keyword.toLowerCase() === group.toLowerCase() ) {
				members = personality.groups[g].members;
				break;
			}
		}

		// Check for match against any synonyms, caselessly
		var matches = false;
		for( var m = 0; m < members.length; m +=1 ) {
			if( members[m].toLowerCase() === word.toLowerCase() ) {
				matches = true;
				break;
			}
		}

		return matches;
	}

	formatOutput( pattern, variable, conjugations ) {  // XXX
		var opener;
		var closer;
		var p = 0;
		do {
			opener = pattern.indexOf('[',p);
			if( pattern[opener-1] === '\\' ) {
				p      = opener + 1;
				opener = -1;
			}
			else {
				closer = pattern.indexOf(']',opener+1);
				if( closer === -1 ) {
					p      = opener + 1;
					opener = -1;
				}
				else {
					// Get variable value else variable name as the value
					let name = pattern.substring( opener + 1, closer ).trim();
					var value = variable[name] === undefined ? name : variable[name];

					// Apply any conjugations to value
					for( let c = 0; c < conjugations.length; c += 1 ) {
						value = value.replace( conjugations[c].regex,'$1' + conjugations[c].to + '$2');
						}

					// Insert value into the output puttern
					pattern = pattern.substring(0,opener) + value + pattern.substr(closer+1);
					p    = opener + value.length + 2;
				}
			}
		} while( opener !== -1 );
		return pattern;
	}

	isOptionValid( option, personality ) {
		return true;
	}

	pickOption( awareness, personality ) {
		// TODO: build in smart algorithms
		var preferred = awareness.options[this.randomBetween(0,awareness.options.length-1)];
		return preferred;
	}

	randomBetween( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) + min );
	}

	performActions( actions, awareness, personality ) {
		// TODO: add contextPriority at other points in "interpret"
		awareness.contextPriority = this.contextPriority( awareness.contextName, personality.contexts );
		//console.log('AWARE: ' + JSON.stringify( awareness, null, '  ' ) );
		var response = '';
		for( var a = 0; a < actions.length; a += 1 ) {
			var action = actions[a];
			//console.log('ACTION ' + a + ' ' + JSON.stringify(action.command) + ': ' + JSON.stringify(action.param) );
			switch( action.command.toLowerCase() ) {
				case 'synonyms':      this.actionSynonyms( action.param, awareness, personality ); break;
				case 'group':         this.actionGroup( action.param, awareness, personality ); break;
				case 'conjugateand':  this.actionConjugateAnd( action.param, awareness, personality ); break;
				case 'conjugateto':   this.actionConjugateTo( action.param, awareness, personality ); break;
				case 'inverton':      this.actionInvertOn( action.param, awareness, personality ); break;
				case 'retain':        this.actionRetain( action.param, awareness, personality ); break;
				case 'say':           response += this.actionSay( action.param, awareness, personality ); break;	
				case 'remember':      this.actionRemember( action.param, awareness, personality ); break;
				case 'recall':        this.actionRecall( action.param, awareness, personality ); break;
				case 'forget':        this.actionForget( action.param, awareness, personality ); break;
				case 'interpretas':   response += this.actionInterpretAs( action.param, awareness, personality ); break;
				case 'expectas':      this.actionExpectAs( action.param, awareness, personality ); break;
				case 'enter':         this.actionEnter( action.param, awareness, personality ); break;
				case 'exit':          this.actionExit( action.param, awareness, personality ); break;
				case 'seek':          this.actionExit( action.param, awareness, personality ); break;
				case 'avoid':         this.actionExit( action.param, awareness, personality ); break;
				default:
					console.log('Command "' + action.command + '" recognized but not supported.');
			}
		}
		return response;	
	}

	contextPriority( name, contexts ) {
		for( let c = 0; c < contexts.length; c += 1 ) {
			if( name === contexts[c].name ) return c;
		}
		console.log('WARNING: Context unknown.');
	}

	// ========== Action Performances ==========
	
	// Assign synonyms to a keyword to enhance recognizing, generally..
	actionSynonyms( param, awareness, personality ) {
		var synonyms = personality.synonyms;
		let members = param.members.split(',');
		for( let i = 0; i < members.length; i += 1 ) members[i] = members[i].trim();

		// See if synonym set already exists
		var found = undefined;
		for( let i = 0; i < synonyms.length; i += 1 ) {
			if( synonyms[i].keyword.toLowerCase() === param.keyword.toLowerCase() ) {
				found = synonyms[i];
				break;
			}
		} 

		// If exists, replace else append
		if( found !== undefined ) {
			found.context = awareness.contextName;
			found.members = members;
		}
		else {
			personality.synonyms.push({ context:awareness.contextName, keyword:param.keyword, members:members });
		}
	}

	// Assign group of terms to a keyword to enhance recognizing wildcards (only matches if in group)
	actionGroup( param, awareness, personality ) {
		var groups = personality.groups;
		let members = param.members.split(',');
		for( let i = 0; i < members.length; i += 1 ) members[i] = members[i].trim();

		// See if group already exists
		var found = undefined;
		for( let i = 0; i < groups.length; i += 1 ) {
			if( groups[i].keyword.toLowerCase() === param.keyword.toLowerCase() ) {
				found = groups[i];
				break;
			}
		} 

		// If exists, replace else append
		if( found !== undefined ) {
			found.context = awareness.contextName;
			found.members = members;
		}
		else {
			personality.groups.push({ context:awareness.contextName, keyword:param.keyword, members:members });
		}
	}

	// Specify two-way conjugations
	actionConjugateAnd( param, awareness, personality ) {
		this.actionConjugateTo( param, awareness, personality );
		this.actionConjugateTo( {first:param.second,second:param.first}, awareness, personality );
	}

	// Specify one-way conjugation
	actionConjugateTo( param, awareness, personality ) {
		let conjugations = personality.conjugations;

		// See if conjugation "from" already exists
		var found = undefined;
		for( let i = 0; i < conjugations.length; i += 1 ) {
			if( conjugations[i].from.toLowerCase() === param.first.toLowerCase() ) {
				found = conjugations[i];
				break;
			}
		} 

		// If exists, replace conjugation "to" else append new conjugation "from" and "to"
		if( found !== undefined ) {
			found.context = awareness.contextName;
			found.to      = param.second;
		}
		else {
			// Add new one with "from" regex matcher for the conjugation
			let regex = new RegExp( '([^A-Za-z])' + param.first.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '([^A-Za-z])', 'gim' );
			personality.conjugations.push({ context:awareness.contextName, regex:regex, from:param.first, to:param.second });
		}

		// Resort conjugations from longest to shortest
		personality.conjugations.sort(( a, b ) => { return b.from.length - a.from.length });
	}

	actionInvertOn( param, awareness, personality ) {
	}

	actionRetain( param, awareness, personality ) {
		personality[param.variable] = '';
		if( param.for !== undefined ) { 
			console.log('RETAIN FOR ' + JSON.stringify( param.for )); // ZZZ
			// Translate duration to specific time
			// TODO

			// Schedule unretain for that time
			// TODO
		}
	}

	actionUnretain( param, awareness, personality ) {
	}

	actionSay( param, awareness, personality ) {
		return this.formatOutput( param.message, awareness.variable, personality.conjugations ).trim() + ' ';
	}

	actionRemember( param, awareness, personality ) {
		// TODO: format output pattern
		personality.memories.push( { context:'general', memory:param.message } );
	}

	actionRecall( param, awareness, personality ) {
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
	
	actionForget( param, awareness, personality ) {
		var matchers = this.formatRecognizerPattern(param.message);
		for( var m = 0; m < personality.memories.length; m += 1 ) {
			var memory = personality.memories[m].memory;
			found = this.matchRecognizer( matchers, memory, personality );
			if( found !== false ) memories[m].splice(m,1);
		}
	}

	actionInterpretAs( param, awareness, personality ) {
	}

	actionExpectAs( param, awareness, personality ) {
	}

	actionEnter( param, awareness, personality ) {
	}

	actionExit( param, awareness, personality ) {
	}

	actionSeek( param, awareness, personality ) {
	}

	actionAvoid( param, awareness, personality ) {
	}

	durationToTime( duration ) {
				//'years','months','weeks','days','hours','minutes','seconds'
	}



} // End of class

exports.Moringa = Moringa;
