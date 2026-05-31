#!/usr/bin/node

const { Moringa } = require('./moringa.js');

const agent = new Moringa(() => {}, 'testbot');

const malformedScript = `
    recognizer "hello
        say "missing quote"
`;

console.log('Testing malformed script...');
console.log('Script:', JSON.stringify(malformedScript));

try {
    const result = agent.merge(malformedScript, 'testbot');
    console.log('Result:', result);
    console.log('Type:', typeof result);
    console.log('Success: merge returned error message instead of throwing');
} catch(e) {
    console.log('Error: merge threw exception:', e);
}