
// Copyright (C) 2018 By Matthew C. Tedder
// All Rights Reserved
//
// TO DO ITEMS:
//  [ ] Directives not working case-sensitive
//  [ ] Make send MoringaScript errors to self..  (for self-error handling and also making self-diagnostics possible)
// 	[ ] Decision logic
// 	[ ] Retention of variables for standard fading
// 	[ ] Seekers and Avoiders
// 	[ ] expectations inherent Seekers
// 	[ ] Moringa errors inherent Avoiders
// 	[ ] Multi-Channel Communication Support..
// 	    Multiple models of "self" with shared memory and @chnnel differentiator.
// 	[ ] Inter-Model Communication (Say "message" To "model") and reception source
// 	[ ] Create named model instances.. refer to each by name.

var tokenizer = require('retokenizer');
require('datejs');

class Moringa {
	constructor( callback, name = 'myself', script = '' ) {
		this.callback      = callback;  // where to send interjections
		this.name          = name;      // name of base model 
		this.fading        = 60000;     // nanoseconds before variable values fade away
		this.energy        = 5;         // standard energy -- limits looping through re-interpretations
		this.inputCount    = 0;         // number of inputs since awakening
		this.model         = {};        // per model, an array of contexts; a context holds an array of recognizers; holding array of options; holding array of actions 
		this.nextScheduled = null;      // when next output or action command is scheduled
		this.logEntries    = [];        // for debugging purposes
		this.traces        = [];        // What kinds of things to log: all, input, compared, matched, options, actions

		this.wipe();
		if( script !== '' ) this.merge( script, name );
	}

	log( message, traceAs ) {
		if( traceAs === undefined ) console.log('ASSIGN TRACE FOR: ' + message);
		if( this.traces.indexOf('all') !== -1 ) {
			this.logEntries.push(message);
			return;
		}
		for( var i = 0; i < this.traces.length; i += 1 ) {
			var trace = this.traces[i];
			if( traceAs.trim().toLowerCase() === trace.trim().toLowerCase() ) this.logEntries.push(message);
		}
	}

	// Checks and performs scheduled actions at appropriate times..
	checkSchedule() {
		// Output any scheduled messages (should be pre-formatted for output)
		var currently = new Date();
		var upcoming  = 0;

		// Execute any scheduled action sequence
		for( var name in this.model ) {
			var model = this.model[name];
			for( var i = 0; i < model.schedules.length; i += 1 ) {
				var scheduled = model.schedules[i];

				// If time to perform output or action(s) then do so Else determine next time to schedule for..
				if( scheduled.performed === false && currently.getTime() >= scheduled.when.getTime() ) {
					this.performActions( scheduled.actions, model );
					scheduled.performed = true;
				}
				else if( scheduled.performed === false && ( upcoming === 0 || scheduled.when.getTime() < upcoming) ) upcoming = scheduled.when.getTime();
			}

		}

		// Setup timeout for next scheduled output or action sequence..
		if( upcoming > 0 ) {
			let nextCheck = upcoming - currently.getTime();
			if( nextCheck > 0 ) {
				//console.log( 'Waiting For ' + (nextCheck) + ' milliseconds.' );
				this.timeout = setTimeout( this.checkSchedule.bind(this), nextCheck );
			}
		}
	}

	// Erases specified model else resets entire agent to blank
	wipe( name ) {
		if( name === undefined ) {
			this.model = [];
			name = this.name;
		}
		this.model[name] = {      // each model is named
			fading:60,        // number of seconds before short term memories fade -- TODO: add option for custom fading
			contexts:[],      // each, e.g. { name:'general', recognizers:[], active:true }
			memories:[],      // each, e.g. { context:'general', memory:'the sky is blue', timeStamp:new Date() }
			conjugations:[],  // each, e.g. { context:'general', from:'me', to:'you' }
			synonyms:[],      // each, e.g. { context:'general', keyword:'yes', members:['yeah','yep','yup','sure'] }
			schedules:[],     // each, e.g., { context:'general', when:0, performed:false, actions:{} } 
			expects:[],       // each, e.g., { expect:'yes', matchers:[], as:'I would like to kiss you.', timeStamp:new Date() }
		};
		this.model[name].contexts.push({
				name:'general',  // general context of model (interpreted after any other active context(s))
				recognizers:[],  // context's recognizers
				sequences:[],    // context's sequences, e.g. { name:'..', actions:[] } 
				active:true
		});
	}

	// Amalgamate script into specified model else to agent directly
	merge( script, name = this.name ) {
		if( this.model[name] === undefined ) return 'Failure: Specified foundation "' + name + '" could not be supplemented because it does not exist.'; 
		var model   = this.model[name];   // each model comprises an array of contexts 
		var context = model.contexts[0];  // general context of model 

		// MoringaScript Syntax Lexicon
		var syntax = {
			splitters:[
				' ','\t','\n','--',
				'memories',
				'recognizer','fallback','exclusive','additional','option','always','if',
				'synonyms',':',',','conjugate','and',
				'say','ask','remember','recall','forget','interpret','expect','as',
				'enter','exit','context'
			],
			removes:[' ','\t'],
			enclosures:[
				{ opener:'--', closer:'\n' },
				{ opener:'"', escaper:'\\', closer:'"' },
				{ opener:'if', closer:'\n' },
				{ opener:':', closer:'\n' }
			]
		};
		var tokens = tokenizer( script.replace(/\r/gm,''), syntax, {rich:true} );
		var t;
		//console.log( 'TOKENS:\n' + JSON.stringify( tokens, null, '  ' ) + '\n\n' ); 

		// Extract Any Memory Declarations
		t = 0;
		var timeStamp = new Date();
		while( t < tokens.length ) {
			if( tokens[t].type === 'splitter' && tokens[t].value.toLowerCase() === 'memories' ) {
				let cutFrom = t;
				t += 1;
				while( t < tokens.length && (tokens[t].value === '\n' || tokens[t].value === ',' || tokens[t].value === '"') ) {
					if( tokens[t].value === '\n' || tokens[t].value === ',' ) {
						t += 1;
						continue;
					}
					this.setMemory( 'predefined', tokens[t+1].value, model );
					t += 3;
				}
				tokens.splice( cutFrom, (t - cutFrom) );
				t = cutFrom - 1;
			}
			t += 1;
		}

		// If quote not closed by end of line, make error clear closing quote is missing..
		for( t = 0; t < tokens.length; t += 1 ) {
			if( tokens[t].type === 'opener' && tokens[t].value === '"' && tokens[t+1] !== undefined && tokens[t+1].value.indexOf('\n') !== -1 ) {
				throw('Syntax Error: quote on line ' + tokens[t].lineNo + ' not closed.');
			}
		}
		
		var i = 0;
		
		// Begin with assumption we are in global recognizer's global option
		//var recognizer = { pattern:'', matchers:[], options:[], actions:[] };
		var recognizer = this.getRecognizer( context.recognizers, [], [] );  // old recognizers, pattern, and matchers
		var option     = recognizer;  // to collect recognizer's always actions
		context.recognizers.push(recognizer); 

		// Notes: * = anything; ? prefix = may or may not be; ~", = comma quote list
		var commands = [
			{ command:'comment',      gram:'-- * \n',                                          param:{ message:1 }              },  // useful to export with comments
			{ command:'context',      gram:'context " * "',                                    param:{ context:2 }              },
			//{ command:'recognizer',   gram:'recognizer " * "',                                 param:{ pattern:2 }              },
			{ command:'recognizer',   gram:'recognizer ",',                                    param:{ pattern:2 }              },
			{ command:'alwaysif',     gram:'?exclusive ?additional always if * \n',            param:{ condition:2 }            },  
			{ command:'optionif',     gram:'?fallback ?exclusive ?additional option if * \n',  param:{ condition:2 }            },  
			{ command:'option',       gram:'?fallback ?exclusive ?additional option',          param:{}                         }, 
			{ command:'sequence',     gram:'sequence " * " \n',                                param:{ seqname:2 }              }, 
			{ command:'doSequence',   gram:'do " * " in " * " \n',                             param:{ seqname:2, in:6 }        }, 
			{ command:'doSequence',   gram:'do " * " at " * " \n',                             param:{ seqname:2, at:6 }        }, 
			{ command:'doSequence',   gram:'do " * " \n',                                      param:{ seqname:2 }              }, 
			{ command:'do',           gram:'do in " * " \n',                                   param:{ in:3 }                   }, 
			{ command:'do',           gram:'do at " * " \n',                                   param:{ at:3 }                   }, 
			{ command:'synonyms',     gram:'synonyms * : * \n',                                param:{ keyword:1, members:3 }   },
			{ command:'conjugateAnd', gram:'conjugate " * " and " * " \n',                     param:{ first:2, second:6 }      }, 
			{ command:'conjugateTo',  gram:'conjugate " * " to " * " \n',                      param:{ first:2, second:6 }      }, 
			{ command:'say',          gram:'say " * " at " * " \n',                            param:{ message:2, at:6 }        },
			{ command:'say',          gram:'say " * " in " * " \n',                            param:{ message:2, in:6 }        },
			{ command:'say',          gram:'say " * " \n',                                     param:{ message:2 }              },
			{ command:'ask',          gram:'ask " * " at " * " \n',                            param:{ message:2, at:6 }        },
			{ command:'ask',          gram:'ask " * " in " * " \n',                            param:{ message:2, in:6 }        },
			{ command:'ask',          gram:'ask " * " \n',                                     param:{ message:2 }              },
			{ command:'remember',     gram:'remember " * " \n',                                param:{ message:2 }              },
			{ command:'recall',       gram:'recall " * " \n',                                  param:{ message:2 }              },
			{ command:'forget',       gram:'forget " * " \n',                                  param:{ message:2 }              },
			{ command:'interpretAs',  gram:'interpret as " * " \n',                            param:{ statement:3 }            },
			{ command:'expectAs',     gram:'expect " * " as " * " \n',                         param:{ expecting:2, as:6 }      },
			{ command:'enter',        gram:'enter " * " \n',                                   param:{ context:2 }              },
			{ command:'exit',         gram:'exit " * " \n',                                    param:{ context:2 }              },
			{ command:'seek',         gram:'seek * % * \n',                                    param:{ percent:1, condition:2 } }, 
			{ command:'avoid',        gram:'avoid * % * \n',                                   param:{ percent:1, condition:2 } },
			{ command:'newline',      gram:'\n',                                               param:{}                         }
		];

		// Loop through Code Tokens
		var err    = '';
		var t      = 0;
		var quotes = [];
		while( t < tokens.length ) {
			// Loop through Grammars to Find Matches or Identify Errors
			var found = undefined;
			for( var c = 0; c < commands.length; c += 1 ) {
				var cmd  = commands[c];
				var gram = cmd.gram.split(' ');  // command grammars are defined space-separated ("?" prefixes optionals; "timings" is a sub-grammar)
				var matched = true;              // If a recognized command actually found
				var flags   = [];                // any flags found
				var tt      = t;                 // Searching for command starting at t and ending at tt
				var wildcardFinish;
				var debugLineNo = 99999;
				if( tokens[t].lineNo === debugLineNo ) console.log('Checking if line starting with  "' + tokens[t].value + '" Matches Command ' + JSON.stringify(gram) + '.'); 
				for( var w = 0; w < gram.length; w += 1 ) {
					if( gram[w] === '*' ) {
						// One token matched by wildcard -- because we are assuming it's an enclosure
						if( tokens[t].lineNo === debugLineNo ) console.log('\tWildcard identified (' + tokens[tt].value + ')'); 
						tt += 1;
						continue;
					}

					// Match ?Option (but if not, continue without advancing tt because this was only optional)
					if( gram[w][0] === '?' ) {
						if( gram[w].substr(1).toLowerCase() === tokens[tt].value.toLowerCase() ) {
							if( tokens[t].lineNo === debugLineNo ) console.log('\tOption Flag identified (' + tokens[tt].value + ')');
							flags.push(gram[w].substr(1));  // case preserved as per grammer, although matched caselessly (might be useful)
							tt += 1;
						}
						continue;
					}

					// If comma quote list (collect list of comma separated quotes)
					if( gram[w] === '",' ) {
						quotes = [];
						var more   = true;
						
						while( more && tt < tokens.length ) {
							if( tokens[tt].value === '"' ) {
								quotes.push( tokens[tt+1].value );
								tt += 3;
								if( tokens[tt].value !== ',' ) { more = false; }
								else { tt += 1; }
							}
							else { more = false; }
						}
						if( quotes.length > 0 ) continue;
					}

					// Is Litteral Match?
					if( gram[w].toLowerCase() === tokens[tt].value.toLowerCase() ) {
						if( tokens[t].lineNo === debugLineNo ) console.log('\tLitteral identified (' + tokens[tt].value + ')');
						tt += 1;
						continue;
					}

					// Was No Match -- Error
					if( tokens[t].lineNo === debugLineNo ) console.log('\tFAILED on "' + tokens[tt].value + '" found where "' + gram[w] + '" was expected.'); 
					matched = false;
					break;
				} // end of gram loop (w)
				if( matched ) {
					// Consolidate what was found
					found = { command:cmd.command, begins:t, ends:tt-1, tokens:tokens.slice(t,tt-1), flags:flags, param:{} };

					// Isolate found parameters -- NOTE: positions can change if preceded by ?optionals; undefine check is for ?timings 
					for( var param in cmd.param ) {
						let position = cmd.param[param] + found.flags.length;
						if( found.tokens[position] !== undefined ) {
							// If multiple quotes were collected (",).. 
							if( quotes.length > 0 ) {
								found.param[param] = quotes;
								quotes             = '';
							}  
							else { found.param[param] = found.tokens[ position ].value; }
						}
					}
					break;
				}
				if( found !== undefined ) break;
			} // end of commands loop (c)
			
			// Grammar Unrecognized
			if( found === undefined ) {
				err = 'Malformed Statement at ' + JSON.stringify(tokens[t].value) + ', line ' + tokens[t].lineNo + '.';
				break;
			}

			switch( found.command ) {
				// Things to ignore..
				case 'newline':
				case 'comment':
					break;

				// Architectural Commands
				case 'context':
					context    = {name:found.tokens[2].value, recognizers:[], memories:[], active:false}; 
					//recognizer = { pattern:'', matchers:[], options:[], actions:[] };  // context's global always recognizer 
					recognizer = this.getRecognizer( context.recognizers, [], [] );  // old recognizers, patter, and matchers 
					option     = recognizer;                                           // to collect recognizer's always actions
					context.recognizers.push(recognizer); 
					model.contexts.push(context);
					break;

				case 'recognizer':
					//let matchers = this.formatRecognizerPattern(found.param.pattern[0]);  // translate to format for matching
					//  Translate pattern(s) to format for matching
					let matchers = [];
					if( found.param.pattern.length === 1 && found.param.pattern[0] === '' ) { matchers.push(['']); }  // Deals with case of recognizer "" (empty string)
					else {
						for( var p = 0; p < found.param.pattern.length; p += 1 ) {
							matchers.push(this.formatRecognizerPattern(found.param.pattern[p]));
						}
					}
					//recognizer   = { pattern:found.param.pattern, matchers:matchers, options:[], actions:[] };
					recognizer   = this.getRecognizer( context.recognizers, found.param.pattern, matchers );  
					option       = recognizer;  // to collect recognizer's always actions 
					if( recognizer.merging !== true ) context.recognizers.push(recognizer); 
					break;

				case 'option':
					option       = { condition:'', flags:found.flags, always:false, actions:[] };
					recognizer.options.push(option);
					break;

				case 'optionif':
					option       = { condition:found.param.condition, flags:found.flags, always:false, actions:[] };
					recognizer.options.push(option);
					break;

				case 'alwaysif':
					option       = { condition:found.param.condition, flags:found.flags, always:true, actions:[] }; 
					recognizer.options.push(option);
					break;

				case 'sequence':
					option       = { name:found.param.seqname.trim(), actions:[] };
					context.sequences.push(option);
					break;

				// Action Commands 
				default:
					//console.log('Known but unsupported command "' + found.command + '".');
					let action = { command:found.command, param:found.param, flags:found.flags, lineNo:found.tokens[0].lineNo };
					if( recognizer.merging === true ) {
						if( !this.actionExists( option.actions, action ) ) option.actions.push(action);
					}
					else { option.actions.push(action); }
			}

			// Advance in code to continue with next token
			//console.log('Next token will be ' + tt + ' (' + JSON.stringify(tokens[tt].value) + ')');
			t = tt; 
			
		} // end of tokens loop
		if( err !== '' ) console.log( err );

		//console.log( 'MODEL: ' + JSON.stringify(model,null,'  '));  // To Show Model XXX
		
		// For each context, final processing in preparation for use..
		for( var c = 0; c < model.contexts.length; c += 1 ) {
			var context = model.contexts[c];

			// Unmark all recognizers as merging (any merging is done)
			for( let r = 0; r < context.recognizers.length; r += 1 ) context.recognizers[r].merging = false;

			// Soft Content's recognizers from longest to shortest
			context.recognizers.sort( ( a, b ) => {
				if( a.pattern === '' ) return -1;  // ensure the global "always" recognizer is always first.. 
				//return b.matchers.length) - a.matchers.length;
				return this.patternPriority(b.matchers) - this.patternPriority(a.matchers); 
			});
		}
	} // end of merge()

	// Literal comes before Constrained Variable before Open Variable
	patternPriority( matchers ) { 
		if( !Array.isArray( matchers[0] ) ) matchers = [matchers];  // matchers may come in multiple segments (array of matcher arrays)
		let priority = 0;
		for( var s = 0; s < matchers.length; s += 1 ) {
			for( var i = 0; i < matchers[s].length; i += 1 ) {
				let matcher = matchers[s][i].trim();
				if( matcher[0] === '[' && matcher[matcher.length-1] === ']' ) {
					if( matcher.indexOf('<<') !== -1 ) { priority += 2; }  // constrained variable
					else{ priority += 1; } // open variable
				}
				else { priority += 3; } // literal
			} // i for
		} // s for
		return priority;
	} // end of patternPriority

	// Get Already Existing (same pattern) Else New Recognizer Object 
	getRecognizer( oldRecognizers, pattern, matchers ) { 
		let debug = false;

		// See If the Recognizer Pattern Already Exists.. 
		let recognizer = undefined;
		for( let r = 0; r < oldRecognizers.length; r += 1 ) {
			let oldPattern = oldRecognizers[r].pattern;

			// Do lengths match?
			let matches = ( oldPattern.length === pattern.length ) ? true : false;

			// If lengths match, do elements match?
			if( matches ) {
				for( let i = 0; i < oldPattern.length; i += 1 ) {
					let oldSegment = oldPattern[i];
					let newSegment = pattern[i];
					// TODO: need match disregarding variable names & whitespace
					// but noting variable names to unify actions and options, when merging.. ( could add to recognizer, object for code elsewhere to reference )
					if( oldSegment.toLowerCase() !== newSegment.toLowerCase() ) {
						matches = false;
						break;
					}
				}
			}

			// If matches, get matching oldRecognizer and break out of search..
			if( matches ) {
				recognizer = oldRecognizers[r];
				recognizer.merging = true;  // TODO: later, also add any translation of variable names needed to fully unify the merge..
				break;
			}
		}

		// If Not Found, Create as New
		if( recognizer === undefined ) recognizer = { pattern:pattern, matchers:matchers, options:[], actions:[], merging:false };

		return recognizer;
	}

	// { command:found.command, param:found.param, flags:found.flags, lineNo:found.tokens[0].lineNo };
	actionExists( oldActions, newAction ) {
		let matches = false;  // fails to match by default, if there are not old actions..
		for( let i = 0; i < oldActions.length; i += 1 ) {
			let oldAction = oldActions[i];
			matches = true;
			if( oldAction.command !== newAction.command ) matches = false;
			if( JSON.stringify( oldAction.param ) !== JSON.stringify( newAction.param ) ) matches = false;
			if( JSON.stringify( oldAction.param ) !== JSON.stringify( newAction.param ) ) matches = false;
			// Note: We are not comparing action.flags to allow those to be overridden, if all else matches.. TODO
			if( matches ) break;
		}
		return matches;
	}

	// Ensure memory is written
	setMemory( context, memory, model ) {
		var found = false;
		for( var m = 0; m < model.memories.length; m += 1 ) {
			if( model.memories[m].memory === memory ) {
				model.memories[m].context   = context;
				model.memories[m].timeStamp = new Date();
				model.memories[m].times    += 1;
				found = true;
				break;
			}
		}
		if( !found ) model.memories.push( { context:context, memory:memory, timeStamp:new Date(), times:1 } ); 
	}

	// Translate string recognizer pattern to matchable version
	formatRecognizerPattern( string ) {
		// Tokenize recognizer pattern
		let syntax = {
			splitters:[' ','\t','\n','~','`','!','@','#','$','%','^','&','*','(',')','-','+','_','=','{','}','[',']',':',';','"','\'','<','>',',','.','?','/','|','\\'],
			removes:[' ','\t','\n'],
			enclosures:[
				{opener:'[',closer:']'},              // [abc] = variable "abc"; [abc<<def] = only if value among "def", assign to "abc"
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
		//return JSON.stringify( this.model[name], null, '  ' );
		let model = this.model[name];
		if( model === undefined ) return '-- Cannot export non-existant model named "' + name + '"';

		let script = '';
		let tabs   = 0;
		for( let c = 0; c < model.contexts.length; c += 1 ) {
			let context = model.contexts[c];
			script += '\nContext: "' + context.name + '"\n';
			tabs   += 1;
			for( let r = 0; r < context.recognizers.length; r += 1 ) {
				let recognizer = context.recognizers[r];

				// Blank Recognizer is Global
				if( recognizer.pattern !== '' ) {
					let pattern = JSON.stringify( recognizer.pattern );
					script += this.stringOf('\t',tabs) + '\nRecognizer ' + pattern.substr(1,pattern.length-2) + '\n';
					tabs += 1;
				}

				// Add Any Recognizer Always Actions
				for( let a = 0; a < recognizer.actions.length; a += 1 ) script += this.stringifyAction( recognizer.actions[a], tabs );

				// For Options, Regardless of If Global or Not
				for( let o = 0; o < recognizer.options.length; o += 1 ) {
					let option = recognizer.options[o];
					// TODO: for two below, add option's options
					if( option.condition === '' && option.actions.length === 1 ) {
						script += this.stringOf('\t',tabs) + 'Option ' + this.stringifyAction( option.actions[0], 0 );
					}
					else {
						script += this.stringOf('\t',tabs) + 'Option ' + JSON.stringify( option.condition ) + '\n';
						tabs += 1;
						for( let a = 0; a < option.actions.length; a += 1 ) script += this.stringifyAction( option.actions[a], tabs );
						tabs -= 1;
					}
				}
				if( recognizer.pattern !== '' ) tabs -= 1;
			}
			tabs -= 1;
		}
		tabs -= 1;  // should now be zero
		return script;
	}

	stringifyAction( action, tabs ) {
		let script;
		switch( action.command ) {  // TODO: Finish for all commands..
			case 'say':
				script = this.stringOf('\t',tabs) + 'Say ' + JSON.stringify(action.param.message) + '\n';
				break;
			case 'remember':
				script = this.stringOf('\t',tabs) + 'Remember ' + JSON.stringify(action.param.message) + '\n';
				break;
			case 'recall':
				script = this.stringOf('\t',tabs) + 'Recall ' + JSON.stringify(action.param.message) + '\n';
				break;
			case 'forget':
				script = this.stringOf('\t',tabs) + 'Forget ' + JSON.stringify(action.param.message) + '\n';
				break;
			case 'interpretAs':
				script = this.stringOf('\t',tabs) + 'Interpret As ' + JSON.stringify(action.param.statement) + '\n';
				break;
			case 'conjugateAnd':
				script = this.stringOf('\t',tabs) + 'Conjugate ' + JSON.stringify(action.param.first) + ' And ' + JSON.stringify(action.param.second) + '\n';
				break;
			case 'conjugateTo':
				script = this.stringOf('\t',tabs) + 'Conjugate ' + JSON.stringify(action.param.first) + ' To ' + JSON.stringify(action.param.second) + '\n';
				break;
			default:
				script = this.stringOf('\t',tabs) + '-- Command "' + action.command + '" Undrecognized: ' + JSON.stringify(action.param) + '\n';
		}
		return script;
	}

	stringOf( single, num ) {
		let multiple = '';
		for( let i = 0; i < num; i += 1 ) { multiple += single; }
		return multiple;
	}

	// ===== Process an Input Message =====
	input( message, name = this.name, callback = this.callback ) {
		this.inputCount += 1;
		this.log('User input (' + this.inputCount + '): ' + message, 'input');
		let model = this.model[name];
		this.interpret( message, model );
		let log = 'Valid options:\n';
		for( var i = 0; i < model.awareness.options.length; i += 1 ) {
			log += '\tOption #' + (i+1) + ' actions:\n';
			for( var ii = 0; ii < model.awareness.options[i].actions[ii].length; ii +=1 ) {
				log += '\t\t' + JSON.stringify(model.awareness.options[i].actions[ii]) + '\n';
			}
		}  
		this.log( 'Valid options: ' + log, 'options' );
		let preferred    = this.pickOption( model );
		if( preferred !== undefined ) this.performActions( preferred.actions, model );
	}

	// Returns Awareness from Recognition and Deductions
	interpret( message, model, refresh = true ) {
		var timeStamp = new Date();  // to give each variable collected in this interpretation, a common timeStamp from which to group, distinguish, and fade

		// Variable to collecting options and related data in; search stops when recognizer is matched
		var awareness;
		if( refresh ) {
			awareness = {
				energy:this.energy, // maximum re-interpretations allowed..
				recognizer:false,   // recognizer matched (else undefined)
				contextName:'',     // context of matched recognizer
				contextPriority:0,  // current order of context, to be interpreted
				variable:{},        // variables collected -- e.g, 'name':[{value:'xx',timeStamp:'xx'},..];
				options:[],         // valid options collected
				validOptions:[],    // options with conditions evaluating to true
			};
	
			model.awareness = awareness;
		}
		else {
			awareness = model.awareness;
			awareness.energy -= 1;
			if( awareness.energy < 1 ) return awareness;  // TODO: some indicator? maybe Remember "i am exhausted"
			}

		// First check if anything particularly expected at this time -- and convert to explicit meaning.. 
		for( var x = 0; x < model.expects.length; x += 1 ) {
			// If expect is not user's next input and is too old, remove and check next..
			if( this.inputCount > (model.expects[x].inputCount + 1) && timeStamp > model.expects[x].until ) {
				model.expects.splice(x,1);
				continue;
			}

			// Does message match expect?  Then change message to "as"
			if( this.matchRecognizer( message, model.expects[x].matchers, model ) ) {
				message = this.formatOutput( model.expects[x].as, awareness.variable, [] );
				this.log('Matched expectation (' + JSON.stringify(model.expects[x].expect) + '), so changing to: ' + JSON.stringify(message));
				break;
			} 
		}

		// For each context (0 is always general; higher to lower priority)..
		for( var c = model.contexts.length-1; c >= 0; c -= 1 ) {
			awareness.contextName = model.contexts[c].name; 
			awareness.contextPriority = c;
			
			// For each recognizer..
			for( var r = 0; r < model.contexts[c].recognizers.length; r += 1 ) {
				var recognizer = model.contexts[c].recognizers[r];

				// If the context's always recognizer.. 
				if( recognizer.pattern === '' ) {
					// Perform always actions
					this.performActions( recognizer.actions, model );

					// Collect options performing any valid always if .. actions
					for( var i = 0; i < recognizer.options.length; i += 1 ) {
						let option = recognizer.options[i];
						if( option.always ) {
							if( this.isConditionTrue( option.condition, model ) ) this.performActions( option.actions, model );
						}
						else { awareness.options.push(option); }
					}
					continue;
				}

				// If recognizer is matched, collect all its options then stop collecting any further options.
				let variable = this.matchRecognizer( message, recognizer.matchers, model );
				this.log( 'Compared recognizer: ' + recognizer.pattern, 'compared' );
				if( variable !== false ) {
					awareness.recognizer = recognizer.pattern;

					// Add to log
					this.log( 'Matched recognizer ' + JSON.stringify(recognizer.pattern) + ', capturing:' + this.listVariables(variable),'matched' );

					// Add variables picked up from recognizer to awareness..
					for( var name in variable ) awareness.variable[name] = variable[name]; // TODO: implement following lines in place of this one
					//if( awareness.variable[name] === undefined ) awareness.variable[name] = [];
					//for( var name in variable ) awareness.variable[name].push({value:variable[name],timeStamp:timeStamp});

					// Perform recognizer's always actions
					this.performActions( recognizer.actions, model );

					// Add recognizer's options to awareness
					for( var i = 0; i < recognizer.options.length; i += 1 ) awareness.options.push(recognizer.options[i]);
					break;
				}
			} // end of recognizers (r) for loop
			if( awareness.recognizer !== false ) break;
			
		} // end of context (c) for loop

		return awareness;
	}

	listVariables( variable ) {
		var listing = '';
		for( let name in variable ) {
			listing += '\n\t' + name + ' = ';
			for( var v = 0; v < variable[name].length; v += 1 ) {
				if( v > 0 ) listing += ' ,';
				listing += JSON.stringify(variable[name][v].value);
			}
		}
		if( listing === '' ) listing = '\n\t(No variables)';
		return listing;
	}

	// Returns false else object of collected variables
	matchRecognizer( message, matchers, model ) {
		// TODO: check and see if this should sometimes bring in message already tokenized into words.. 
		var actuals;
		if( typeof message === 'string' ) {
			let syntax = {	
				splitters:[' ','\t','\n','~','`','!','@','#','$','%','^','&','*','(',')','-','+','_','=','{','}','[',']',':',';','"','\'','<','>',',','.','?','/','|','\\'],
				removes:['\t','\n']
			}
			actuals = tokenizer( message, syntax, {rich:false} )
		}
		else { actuals = message; };

		// If single segment, make into list of one segment
		if( !Array.isArray(matchers[0]) ) matchers = [matchers];

		// Attempt Match, Collecting Variables over Each Segment
		var variable     = {};
		var skipSegments = [];  // Segments {first:0,last:0} already matched -- so not to match two segments over same actuals
		for( var segmentNo = 0; segmentNo < matchers.length; segmentNo += 1 ) {
			variable = this.matchRecognizerSegment( variable, actuals, matchers[segmentNo], skipSegments, model );
			if( variable === false ) break;
		}
		return variable;
	}

	// Returns false else object of collected variables
	matchRecognizerSegment( variable, actuals, matchers, skipSegments, model ) {
		// Check how many matchers in actuals (message tokens), in order.. 
		var m         = 0;
		var a         = 0;
		var firstActual;   // first to delete, if matched (to prevent double matching with subsequent segments)
		var lastActual;    // last to delete, if matched
		//var variable  = {};
		var betweens  = '';
		var timeStamp = new Date();
		for( a = 0; a < actuals.length; a += 1 ) {
			if( !( m < matchers.length ) ) break;
			var matcher = matchers[m];
			// If variable..
			if( !this.inZone(a,skipSegments) && matcher[0] === '[' && matcher[matcher.length-1] === ']' ) {
				lastActual = a; if( firstActual === undefined ) { firstActual = a; }  // ensure we capture first + last found actuals
				var name  = matchers[m].substr(1,matchers[m].length-2).trim();

				// Capture variable until next matcher or end of actuals (of no more matchers)
				var value = '';

				// Collect actuals into value until we run into the next matcher in the grammar (or end of actuals if no next matcher)
				m += 1;
				while( a < actuals.length ) {
					if( matchers[m] !== undefined && this.wordMatches( actuals[a], matchers[m], model ) ) break;
					value += actuals[a];
					a += 1;
				}
				a -= 1;
				
				// remove all punctuation and outlaying spaces
				value = value.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

				if( name.indexOf('<<') !== -1 ) {
					let group = name.split('<<')[1].trim();
					name      = name.split('<<')[0].trim();
					//console.log( 'Constrain "' + value + '" from "' + group + '": ' + JSON.stringify( model.awareness.variable[group]) );
					if( group !== '' && !this.valueInVariable( model.awareness.variable[group], value ) ) return false;
				}

				// All is well.. assign variable to collection (singular overwrite, as opposed to Recall command that may collect multipe values)
				if( name !== '' ) variable[name] = [{ value:value, timeStamp:timeStamp }]; 
			} 
			// Else litteral
			else {
				if( !this.inZone(a,skipSegments) && this.wordMatches( actuals[a], matcher, model ) ) {
					lastActual = a; if( firstActual === undefined ) { firstActual = a; }  // ensure we capture first + last found actuals
					// Record any relevant implicit variables between matchers
					betweens = betweens.trim();
					if( betweens !== '' ) {
						if( m < matchers.length ) variable['before-' + m] = [{ value:betweens, timeStamp:timeStamp }];    
						if( m > 0 ) variable['after-' + (m-1)]            = [{ value:betweens, timeStamp:timeStamp }];
						betweens                                          = ''; 
					}

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
		betweens = betweens.trim();
		if( betweens !== '' ) variable['after-' + (m-1)] = [{ value:betweens, timeStamp:timeStamp }];  // TODO: add date/time to value for fading

		//Remove any already matched actuals (to prevent double matching between segments)
		//if( firstActual !== undefined ) actuals.splice(firstActual, lastActual-firstActual+1);  // XXX to remove
		skipSegments.push({ first:firstActual, last:lastActual });

		// This Recognizer Matched, if all matchers were found in input message actuals 
		if( m === matchers.length ) {
			return variable;
		} 
		else { return false; }
	}

	// Given an array of zones {first:0,last:0}, returns true if index is in any of them
	inZone( index, zones ) {
		var inZone = false;
		for( var z = 0; z < zones.length; z += 1 ) {
			let zone = zones[z];
			if( index >= zone.first && index <= zone.last ) {
				inZone = true;
				break;
			}
		}
		return inZone;
	}

	// Does word match matcher or any synonyms thereof?
	wordMatches( word, matcher, model ) {
		// Collect any synonyms
		var synonyms = [matcher];
		for( let s = 0; s < model.synonyms.length; s += 1 ) {
			if( model.synonyms[s].keyword.toLowerCase() === matcher.toLowerCase() ) {
				for( var m = 0; m < model.synonyms[s].members.length; m += 1 ) synonyms.push( model.synonyms[s].members[m] );
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

	// Is value among any values from variable given? 
	valueInVariable( values, value ) { 
		if( values === undefined ) return false; // variable didn't exist will come in as undefined.. so view as not found
		var matches = false;
		for( var v = 0; v < values.length; v +=1 ) {
			if( values[v].value.toLowerCase() === value.toLowerCase() ) {
				matches = true;
				break;
			}
		}
		return matches;
	}

	// Put translate pattern variables to patterns, apply conjugations, convert any blank (unnamed) variables to something else nothing (default).
	formatOutput( pattern, variable, conjugations, blankTo = '' ) {
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
					var name = pattern.substring( opener + 1, closer ).trim();
					if( name === '' ) {
						// Empty variable specifiers ([]) are retained in the pattern as wildcards
						value = blankTo;
						pattern = pattern.substring(0,opener) + value + pattern.substr(closer+1);
						p    = opener + value.length + 2;
					} 
					else {
						// Get variable value else variable name as the value
						var value = name;
						// TODO: add ability in notation to specify "and", "or", or "and/or"
						if( variable[name] !== undefined ) value = this.valuesToCommaList(variable[name],'and');

						// Insert value into the output puttern
						pattern = pattern.substring(0,opener) + this.conjugate(value, conjugations) + pattern.substr(closer+1);
						p    = opener + value.length + 2;
					}

				}
			}
		} while( opener !== -1 );
		return pattern;
	}

	valuesToCommaList( values, relation = 'and/or' ) {
		var commaList = '';
		var comma     = '';
		for( let v = 0; v < values.length; v += 1 ) {
			if( values.length > 1 && v === values.length-1 ) { commaList += comma + relation.trim() + ' ' + values[v].value; }
			else { commaList += comma + values[v].value; }
			comma = ', ';
		}
		return commaList;
	}

	conjugate( oldStr, conjugations ) { 
		let newStr = '';

		// Find first con.from in oldStr
		let alpha   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		let found   = undefined;
		let foundAt = -1;
		let pos     = 0;
		let done    = false;
		while( !done ) {
			for( let c = 0; c < conjugations.length; c += 1 ) {
				let con = conjugations[c];
				if( oldStr.substr(pos).toLowerCase().indexOf( con.from.toLowerCase() ) !== -1 ) {
					found   = con;
					foundAt = pos + oldStr.substr(pos).toLowerCase().indexOf( con.from.toLowerCase() );
					break;
				}
				if( c === conjugations.length -1 ) done = true;  
			}
	
			// If found, add any of oldStr before it, to new str and and matching con.to
			if( found !== undefined ) {
				// Is match a whole word (or part of another word)?
				let first = foundAt;
				let last  = foundAt + found.from.length;
				let isWholeWord = true;
				if( first > 0 && ( alpha.indexOf(oldStr[first-1]) !== -1 ) ) isWholeWord = false;
				if( last < oldStr.length && ( alpha.indexOf(oldStr[last]) !== -1 ) ) isWholeWord = false;
				
				// If whole word, do conjugation else move on..
				if( isWholeWord ) {
					newStr += oldStr.substring( pos, foundAt ) + found.to;
					pos = foundAt + found.from.length;
					if( pos === oldStr.length ) done = true;
					found = undefined;
				}
				else { done = true; }
			}
			else { done = true; }
		}

		// Else just add all remaining oldStr to newStr
		if( pos < oldStr.length ) newStr += oldStr.substr(pos);

		return newStr;
	}

	pickOption( model ) {
		var awareness = model.awareness;
		// Determine which options are currently valid
		awareness.validOptions = [];
		for( var c = 0; c < awareness.options.length; c += 1 ) {
			var option = awareness.options[c];
			if( this.isConditionTrue( option.condition, model ) ) awareness.validOptions.push(option);
		}

		// Determine option preferrabilities and which is highest..
		// TODO: Do properly (by seeks and avoids else human) -- think of intuitive way to add random or round robin options
		var preferred = awareness.validOptions[this.randomBetween(0,awareness.validOptions.length-1)];
		
		// TODO: build pathfinding articulation -- contemplation 
		return preferred;
	}

	randomBetween( min, max ) {
		return Math.floor( Math.random() * ( max - min + 1 ) + min );
	}

	isConditionTrue( condition, model ) { 
		var variable = model.awareness.variable;

		// If no condition given, assume it's true..
		if( condition.trim() === '' ) return true;

		// Tokenize condition
		var syntax = {
			splitters:[
				' ','\t','\n',
				'true', 'false',
				'!=','<>','>=','<=','=','>','<',
				'not','and','or',
				'+','-',
				{type:'number',regex:'[0-9]+'}
			],
			removes:[' ','\t'],
			enclosures:[
				{ opener:'"', escaper:'\\', closer:'"' },
				{ opener:'--', closer:'\n' }
			]
		};
		syntax.enclosures.push( { opener:'(', closer:')', syntax:syntax } );

		var tokens = tokenizer( condition.trim(), syntax, { rich:true, condense:true, betweens:'throw' } );
		//console.log( 'CONDITION TOKENS:\n' + JSON.stringify( tokens, null, '  ' ) + '\n\n' ); 

		let result = this.evaluateCondition( 0, tokens, variable, model );

		// Return only boolean result
		for( let name in variable ) condition = condition.replace(name,variable[name][0].value);
		return this.makeBoolean( result );
	}

	// Returns boolean or number (check by typeof operator); recurses for any parenthesis..
	evaluateCondition( t, tokens, variable, model ) {
		while( t < tokens.length ) {
			var operator;
			var leftValue;
			var rightValue;
			var newValue;

			// Litteral numbers and booleans come in string form -- so we need to translate to a real numbers or booleans
			if( tokens[t].type === 'number' && typeof tokens[t].value !== 'number' ) tokens[t].value = Number(tokens[t].value);
			if( tokens[t].type === 'splitter' && tokens[t].value.toLowerCase() === 'true' ) {
				tokens[t].type  = 'boolean';
				tokens[t].value = true;
			}
			if( tokens[t].type === 'splitter' && tokens[t].value.toLowerCase() === 'false' ) {
				tokens[t].type  = 'boolean';
				tokens[t].value = false;
			}

			// If parenthesis, recurse to convert to result of sub-evaluation
			if( tokens[t].type === 'enclosed' && tokens[t].opener === '(' ) {
				newValue  = this.evaluateCondition( 0, tokens[t].value, variable, model );
				tokens[t] = { type:typeof newValue, value:newValue };
				continue;
			}

			// If pattern, convert token to number of matches found in memory
			if( tokens[t].type === 'enclosed'  && tokens[t].opener === '"' ) {
				tokens[t] = { type:'number', value:this.countMemories( tokens[t].value, variable, model ) };
				continue;
			}

			// Evaluate any 2 part operations (not), right value evaluated recursively..
			if( tokens[t].type === 'splitter' && tokens[t].value.toLowerCase() === 'not' ) {
				// Since blank is considered true, "not" + blank should be false..
				if( tokens[t+1] === undefined ) {
					tokens[t] = { type:'boolean', value:false };
					continue;
				} 
				rightValue = !this.makeBoolean( this.evaluateCondition( t+1, tokens, variable, model ) );
				tokens.splice(t,2,{ type:'boolean', value:rightValue });
				continue;
			}

			// Evaluate any 3 part operations, right value evaluated recursively..
			if( (tokens[t].type === 'number' || tokens[t].type === 'boolean') && tokens[t+1] !== undefined ) {
				operator = tokens[t+1].value;
				if( tokens[t+2] === undefined ) throw 'In if condition, cannot compare a number with nothing.';
				leftValue  = tokens[t].value;
				rightValue = this.evaluateCondition( t+2, tokens, variable, model );
				newValue = null;
				switch( operator.toLowerCase() ) {
					case '+':   newValue = (this.makeNumber(leftValue)  +  this.makeNumber(rightValue)); break;
					case '-':   newValue = (this.makeNumber(leftValue)  -  this.makeNumber(rightValue)); break;
					case '>=':  newValue = (this.makeNumber(leftValue)  >= this.makeNumber(rightValue)); break;
					case '<=':  newValue = (this.makeNumber(leftValue)  <= this.makeNumber(rightValue)); break;
					case '>':   newValue = (this.makeNumber(leftValue)  >  this.makeNumber(rightValue)); break;
					case '<':   newValue = (this.makeNumber(leftValue)  <  this.makeNumber(rightValue)); break;
					case 'and': newValue = (this.makeBoolean(leftValue) && this.makeBoolean(rightValue)); break;
					case 'or':  newValue = (this.makeBoolean(leftValue) || this.makeBoolean(rightValue)); break;
					case '=':
						if( typeof leftValue === 'boolean' || typeof rightValue === 'boolean' ) { newValue = (this.makeBoolean(leftValue) == this.makeBoolean(rightValue)); }
						else { newValue = ( leftValue == rightValue ); }
						break;
					case '<>':
					case '!=':
						if( typeof leftValue === 'boolean' || typeof rightValue === 'boolean' ) { newValue = (this.makeBoolean(leftValue) != this.makeBoolean(rightValue)); }
						else { newValue = ( leftValue != rightValue ); }
						break;
				}
				if( newValue !== null ) tokens.splice(t,3,{ type:'number', value:newValue });
				continue;
			}

			break;
		} // end while 

		// By the time processing reaches here, the expression should be reduced to a single value
		return tokens[t].value;

	} 

	makeNumber( value ) {
		if( typeof value === 'boolean' ) return (value === true ? 1 : 0);
		if( typeof value === 'number' ) return value;
	}

	makeBoolean( value ) {
		if( typeof value === 'boolean' ) return value;
		if( typeof value === 'number' ) return (value === 0 ? false : true);
	}

	countMemories( pattern, variable, model ) {
		var count = 0;
		pattern = this.formatOutput( pattern, model.awareness.variable, model.conjugations );
		var matchers = this.formatRecognizerPattern( pattern );
		for( var m = 0; m < model.memories.length; m += 1 ) {
			if( this.matchRecognizer( model.memories[m].memory, matchers, model ) !== false ) count += 1;
		}
	
		return count;
	}

	performActions( actions, model ) {
		// TODO: add contextPriority at other points in "interpret" - modify priority when recognized in that priority
		model.awareness.contextPriority = this.contextPriority( model.awareness.contextName, model.contexts );
		//console.log('AWARE: ' + JSON.stringify( model.awareness, null, '  ' ) );
		var response = '';
		var toSchedule = { when:null, performed:false, actions:[] };
		for( var a = 0; a < actions.length; a += 1 ) {
			var action = actions[a];

			// Add to log.. 
			if( action.command.substr(0,6) !== 'conjug' ) this.log('Performing action "' + action.command + '": ' + JSON.stringify(action.param), 'actions' );

			// If other than inline "do" command after inline "do" command, just collect actions to schedule..
			if( action.command.toLowerCase() !== 'do' && toSchedule.when !== null ) {
				toSchedule.actions.push(action);
				continue;
			}

			// Perform as per each command..
			switch( action.command.toLowerCase() ) {
				case 'synonyms':      this.actionSynonyms( action.param, model ); break;
				case 'conjugateand':  this.actionConjugateAnd( action.param, model ); break;
				case 'conjugateto':   this.actionConjugateTo( action.param, model ); break;
				case 'say':           this.actionSay( action.param, model ); break;	
				case 'ask':           this.actionAsk( action.param, model ); break;	
				case 'remember':      this.actionRemember( action.param, model ); break;
				case 'recall':        this.actionRecall( action.param, model ); break;
				case 'forget':        this.actionForget( action.param, model ); break;
				case 'interpretas':   this.actionInterpretAs( action.param, model ); break;
				case 'expectas':      this.actionExpectAs( action.param, model ); break;
				case 'enter':         this.actionEnter( action.param, model ); break;  // TODO
				case 'exit':          this.actionExit( action.param, model ); break;  // TODO
				case 'seek':          this.actionExit( action.param, model ); break;  // TODO
				case 'avoid':         this.actionExit( action.param, model ); break;  // TODO
				case 'dosequence':    this.actionDoSequence( action.param, model ); break;
				case 'do':
					if( toSchedule.when !== null ) {
						model.schedules.push( toSchedule ); 
						this.checkSchedule();
					}
					else {
						toSchedule = { when:this.getSpecifiedTime( action.param, new Date(), model), performed:false, actions:[] };
					}
					break;
				default:
					console.log('Command "' + action.command + '" recognized but not supported.');
			}
		}

		// if any actions left to be scheduled, schedule them.. 
		if( toSchedule.when !== null ) {
			model.schedules.push( toSchedule ); 
			this.checkSchedule();
		}
		return response;	
	}

	performScheduledActions() {
	}

	// ========== Action Performances ==========
	
	// Assign synonyms to a keyword to enhance recognizing, generally..
	actionSynonyms( param, model ) {
		var synonyms = model.synonyms;
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
			found.context = model.awareness.contextName;
			found.members = members;
		}
		else {
			model.synonyms.push({ context:model.awareness.contextName, keyword:param.keyword, members:members });
		}
	}

	// Specify two-way conjugations
	actionConjugateAnd( param, model ) {
		this.actionConjugateTo( param, model );
		this.actionConjugateTo( {first:param.second,second:param.first}, model );
	}

	// Specify one-way conjugation
	actionConjugateTo( param, model ) {
		let conjugations = model.conjugations;

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
			found.context = model.awareness.contextName;
			found.to      = param.second;
		}
		else {
			// Add new one with "from" regex matcher for the conjugation
			let regex = new RegExp( '([^A-Za-z])' + param.first.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '([^A-Za-z])', 'gim' );
			model.conjugations.push({ context:model.awareness.contextName, regex:regex, from:param.first, to:param.second });
		}

		// Resort conjugations from longest to shortest
		model.conjugations.sort(( a, b ) => { return b.from.length - a.from.length });
	}

	actionInvertOn( param, model ) {
	}

	actionSay( param, model ) {
		let message = this.formatOutput( param.message, model.awareness.variable, model.conjugations );
		let when    = this.getSpecifiedTime( param, undefined, model ); 
		if( when !== undefined ) {
		    model.schedules.push( { when:when, performed:false, actions:[{command:'say',param:{message:message}}] } );
			this.checkSchedule();
		}
		else {
			// TODO: route to callback, if foundation model, else to model from.
			this.callback( message );
		}
	}

	actionAsk( param, model ) {
		this.actionSay( param, model ); 
		this.setMemory( 'general', this.formatOutput('asked [user]: ' + param.message, model.awareness.variable, model.conjugations), model );
	}

	actionRemember( param, model ) {
		this.setMemory( 'general', this.formatOutput(param.message, model.awareness.variable, model.conjugations), model );
	}

	actionRecall( param, model, flags ) {
		var matchers = this.formatRecognizerPattern(param.message);
		for( var m = 0; m < model.memories.length; m += 1 ) {
			var memory = model.memories[m].memory;
			var found  = this.matchRecognizer( memory, matchers, model );
			if( found !== false ) {
				// For each variable name, remove all previous values and reload, accoridng to what was found
				var variable = model.awareness.variable;
				for( var name in found ) {
					//if( model.awareness.variable[name] === undefined ) model.awareness.variable[name] = []; 
					if( variable[name] === undefined ) variable[name] = []; 
					for( var vf = 0; vf < found[name].length; vf += 1 ) {
						// Is value already known in variable?
						let alreadyKnown = false;
						for( let vs = 0; vs < variable[name].length; vs += 1 ) {
							if( variable[name][vs].value === found[name][vf].value ) {
								alreadyKnown = true;
								break;
							}
						} 
						// If value not already known to variable, append it..
						if( !alreadyKnown ) variable[name].push(found[name][vf]);
					}
				}
			}
		}
	}
	
	actionForget( param, model ) {
		var matchers = this.formatRecognizerPattern(param.message);
		for( var m = 0; m < model.memories.length; m += 1 ) {
			var memory = model.memories[m].memory;
			let found = this.matchRecognizer( matchers, memory, model );
			if( found !== false ) memories[m].splice(m,1);
		}
	}

	actionInterpretAs( param, model ) {
		let statement = this.formatOutput( param.statement, model.awareness.variable, [] );
		this.log('Interpreting As ' + JSON.stringify(statement));
		this.interpret( statement, model, false );
		let preferred = this.pickOption( model );
		if( preferred !== undefined ) this.performActions( preferred.actions, model );
	}

	actionExpectAs( param, model ) {
		let expect   = this.formatOutput( param.expecting, model.awareness.variable, [] );
		let matchers = this.formatRecognizerPattern( expect );
		let as       = this.formatOutput( param.as, model.awareness.variable, [] );
		let until    = new Date();
		until.setSeconds( until.getSeconds() + model.fading );
		model.expects.push({ expect:expect, matchers:matchers, as:as, inputCount:this.inputCount, until:until}); 
		
		// sort longest to shortest matcher..
		model.expects.sort(( a, b ) => { return b.matchers.length - a.matchers.length });
	}

	actionDoSequence( param, model ) {
		// Find named sequence
		var sequence = null;
		for( var c = 0; c < model.contexts.length; c += 1 ) {
			var context = model.contexts[c];
			for( let s = 0; s < context.sequences.length; s += 1 ) {
				if( context.sequences[s].name === param.seqname ) {
					sequence = context.sequences[s];
					break;
				}
			}
			if( sequence !== null ) break;
		}
		if( sequence === null ) throw 'Cannot do sequence "' + param.seqname + '" because it does not exist.';

		let when    = this.getSpecifiedTime( param, undefined, model ); 
		if( when !== undefined ) {
			model.schedules.push({ when:when, performed:false, actions:sequence.actions }); 
			this.checkSchedule();
		}
		else {
			this.performActions( sequence.actions, model );
		}
	}

	actionEnter( param, model ) { // ZZZ
		for(var c = 0; c < model.contexts.length; c += 1 ) {
			if( param.context.toLowerCase().trim() === model.contexts[c].name.toLowerCase().trim() ) {
				mode.contexts[c].active = true;
				this.prioritizeContext( model.contexts, c );
				break;
			}
		}
	}

	// Except for 0 ("general"), if not at end of list, move context to end of list 
	prioritizeContext( contexts, contextNo ) {
		if( contextNo !== 0 && contextNo !== model.contexts.length - 1 ) {
			model.contexts.push( model.contexts[contextNo] );
			model.contexts.splice(contextNo,1);
		}
	}

	actionExit( param, model ) {
		for(var c = 0; c < model.contexts.length; c += 1 ) {
			if( param.context.toLowerCase().trim() === model.contexts[c].name.toLowerCase().trim() ) {
				mode.contexts[c].active = false;
				break;
			}
		}
	}

	actionSeek( param, model ) {
	}

	actionAvoid( param, model ) {
	}

	// ===== Action Support Functions =====

	// Translate MoringaScript time specification to JavaScript Date/Time
	getSpecifiedTime( param, defaultTo, model ) {
		var when = null;
		// Perform after a specified amount of time has passed? 
		if( param.in !== undefined ) {
			let inParam = this.formatOutput( param.in, model.awareness.variable, model.conjugations );
			when = this.durationToDateTime( inParam );
		}

		// Perform when a specified date/time arrives? 
		if( param.at !== undefined ) {
			let atParam = this.formatOutput( param.at, model.awareness.variable, model.conjugations );
			when = new Date();
			when.parse( atParam );  
		}

		// If when not specified, assume now..
		if( when === null ) when = defaultTo;
		return when;
	}

	timeToDisplay( time ) {
		let d = new Date.setTime( time );
		return d.toString('yyyy-MM-ddTHH:mm:ss');
	}

	durationToDateTime( duration, from ) {
		if( from === undefined ) from = new Date();
		let syntax = {
			splitters:[' ','\t','\n','years', 'year', 'months', 'month', 'weeks', 'week', 'days', 'day', 'hours', 'hour', 'minutes', 'minute', 'seconds', 'second'],
			removes:[' ','\t','\n']
		}
		let tokens = tokenizer( duration, syntax, {rich:false} );

		// Sum time in terms of common seconds
		for( var t = 0; t < tokens.length; t += 2 ) {
			let number  = Number( tokens[t] );
			let measure = tokens[t+1].trim();
			if( isNaN(number) ) throw( 'Syntax Error: non-number given as duration specification in ' + JSON.stringify(duration) ); 

			switch( measure.toLowerCase() ) {
				case 'year':    case 'years':    from.add(number).years();   break;
				case 'month':   case 'months':   from.add(number).months();  break;
				case 'week':    case 'weeks':    from.add(number).weeks();   break;
				case 'day':     case 'days':     from.add(number).days();    break;
				case 'hour':    case 'hours':    from.add(number).hours();   break;
				case 'minute':  case 'minutes':  from.add(number).minutes(); break;
				case 'second':  case 'seconds':  from.add(number).seconds(); break;

				default:
					throw( 'Syntax Error: "' + measure + '" not knonw where expecting a year, month, week, day, hour, minute, or second.');
			}
		}
		return from;
	}

	contextPriority( name, contexts ) {
		for( let c = 0; c < contexts.length; c += 1 ) {
			if( name === contexts[c].name ) return c;
		}
		console.log('WARNING: Context unknown.');
	}


} // End of class

exports.Moringa = Moringa;

