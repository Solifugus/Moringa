
let rgx = new RegExp('([^A-Za-z])my([^A-Za-z])','gim');
let msg = "This is my word.";
console.log( msg.replace(rgx,'$1your$2') );
