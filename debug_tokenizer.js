#!/usr/bin/node

var tokenizer = require('retokenizer');

// Test the tokenizer with the same syntax
const script = `synonyms "hello" : hi, hey, greetings\n`;

console.log('Original script:');
console.log(JSON.stringify(script));

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

const tokens = tokenizer( script, syntax );
console.log('\nTokens generated:');
tokens.forEach((token, index) => {
    console.log(`${index}: ${JSON.stringify(token)}`);
});

// Check the expected grammar pattern
console.log('\nExpected grammar: synonyms " * " : * \\n');
console.log('This should match:');
console.log('0: synonyms');
console.log('1: "');
console.log('2: hello');
console.log('3: "');
console.log('4: :');
console.log('5: hi, hey, greetings');
console.log('6: \\n');