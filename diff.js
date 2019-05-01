121d120
< 
286c285
< 			
---
> 
306,307c305,309
< 					for( var p = 0; p < found.param.pattern.length; p += 1 ) {
< 						matchers.push(this.formatRecognizerPattern(found.param.pattern[p]));
---
> 					if( found.param.pattern.length === 1 && found.param.pattern[0] === '' ) { matchers.push(['']); }  // Deals with case of recognizer "" (empty string)
> 					else {
> 						for( var p = 0; p < found.param.pattern.length; p += 1 ) {
> 							matchers.push(this.formatRecognizerPattern(found.param.pattern[p]));
> 						}
346a349,350
> 
> 		//console.log( 'MODEL: ' + JSON.stringify(model,null,'  '));  // To Show Model XXX
727c731
< 						pattern = pattern.substring(0,opener) + value + pattern.substr(closer+1);
---
> 						pattern = pattern.substring(0,opener) + this.conjugate(value, conjugations) + pattern.substr(closer+1);
747a752,798
> 	conjugate( oldStr, conjugations ) {  // YYY 
> 		let newStr = '';
> 
> 		// Find first con.from in oldStr
> 		let alpha   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
> 		let found   = undefined;
> 		let foundAt = -1;
> 		let pos     = 0;
> 		let done    = false;
> 		console.log( 'oldStr:',oldStr);
> 		while( !done ) {
> 			for( let c = 0; c < conjugations.length; c += 1 ) {
> 				let con = conjugations[c];
> 				if( oldStr.substr(pos).toLowerCase().indexOf( con.from.toLowerCase() ) !== -1 ) {
> 					found   = con;
> 					foundAt = pos + oldStr.substr(pos).toLowerCase().indexOf( con.from.toLowerCase() );
> 					break;
> 				}
> 				if( c === conjugations.length -1 ) done = true;  
> 			}
> 	
> 			// If found, add any of oldStr before it, to new str and and matching con.to
> 			if( found !== undefined ) {
> 				// Is match a whole word (or part of another word)?
> 				let first = foundAt;
> 				let last  = foundAt + found.from.length;
> 				let isWholeWord = true;
> 				if( first > 0 && ( alpha.indexOf(oldStr[first-1]) !== -1 ) ) isWholeWord = false;
> 				if( last < oldStr.length && ( alpha.indexOf(oldStr[last]) !== -1 ) ) isWholeWord = false;
> 				
> 				// If whole word, do conjugation else move on..
> 				if( isWholeWord ) {
> 					newStr += oldStr.substring( pos, foundAt ) + found.to;
> 					pos = foundAt + found.from.length;
> 					if( pos === oldStr.length ) done = true;
> 					found = undefined;
> 				}
> 				else { done = true; }
> 			}
> 			else { done = true; }
> 		}
> 
> 		// Else just add all remaining oldStr to newStr
> 		if( pos < oldStr.length ) newStr += oldStr.substr(pos);
> 
> 		return newStr;
> 	}
750d800
< 		var awareness = model.awareness;
1019a1070
> 			let pattern = '([^A-Za-z])' + param.first.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '([^A-Za-z])';
1021c1072
< 			model.conjugations.push({ context:model.awareness.contextName, regex:regex, from:param.first, to:param.second });
---
> 			model.conjugations.push({ context:model.awareness.contextName, pattern:pattern, regex:regex, from:param.first, to:param.second });
