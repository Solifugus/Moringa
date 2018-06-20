
/*
let when = new Date();
console.log( when.toString() );
when.setMonth(when.getMonth()+10);
console.log( when.toString() );
*/

require('datejs');

// Get current date
let date = new Date();
//date.add(3).days();
date.add(2).hours();
console.log( date.toString() );
// Add time to date by measures
// get milliseconds to time
