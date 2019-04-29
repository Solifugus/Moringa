
//let rgx = new RegExp('([^A-Za-z])my([^A-Za-z])','gim');
//let msg = "This is my word.";
//console.log( msg.replace(rgx,'$1your$2') );

//let rgx = new RegExp('^(?=.*mumbai)(?=.*sumit)','gim');
//let msg = "today sumit is in mumbai";
let rgx = new RegExp('^(?=.*i have)(?=.*a quest)(?=.*for you)','gim');
let msg = "a quest for you i have";
console.log( rgx.test(msg) );
