const fs = require('fs');
const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING RECOGNIZER LOADING ===');

const testScript = `
recognizer "test say"
	say "Say command works!"

recognizer "hello"
	say "Hello world!"

recognizer "my name is [name]"
	say "Hello [name]!"
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'debug');

console.log('Loading simple test script...');
agent.merge(testScript, 'debug');

console.log('\n=== CHECKING LOADED RECOGNIZERS ===');
console.log('Bot model:', JSON.stringify(agent.model.debug, null, 2));

console.log('\n=== TESTING INPUT ===');
agent.input('hello', 'debug');
agent.input('test say', 'debug');
agent.input('my name is Bob', 'debug');