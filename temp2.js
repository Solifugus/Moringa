
let first = "you";
let second = "me";
let vregex = '([^A-Za-z])' + first.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '([^A-Za-z])';
console.log('Regex: ' + vregex);
let regex = new RegExp( vregex,'gim');


let text = "We know you are here.";
text = text.replace(regex,'$1'+second+'$2');
console.log(text);
