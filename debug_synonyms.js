#!/usr/bin/node

const { Moringa } = require('./moringa.js');

let messages = [];
const agent = new Moringa((msg) => {
    console.log('Agent says:', msg);
    messages.push(msg);
}, 'testbot');

console.log('Testing synonym parsing...');

// Test 1: Simple synonyms
const script1 = `synonyms "hello" : hi, hey, greetings\n`;
console.log('\nScript 1:', script1);
const result1 = agent.merge(script1, 'testbot');
console.log('Merge result:', result1);
console.log('Synonyms count:', agent.model.testbot.synonyms.length);
console.log('Synonyms:', JSON.stringify(agent.model.testbot.synonyms, null, 2));

// Test 2: With newlines
const script2 = `
synonyms "goodbye" : bye, farewell, ciao
`;
console.log('\nScript 2:', script2);
const agent2 = new Moringa((msg) => messages.push(msg), 'testbot2');
const result2 = agent2.merge(script2, 'testbot2');
console.log('Merge result:', result2);
console.log('Synonyms count:', agent2.model.testbot2.synonyms.length);
console.log('Synonyms:', JSON.stringify(agent2.model.testbot2.synonyms, null, 2));

// Test 3: Test the recognizer
const script3 = `
synonyms "hello" : hi, hey, greetings

recognizer "hello"
    say "Hello to you too!"
`;
console.log('\nScript 3 (with recognizer):', script3);
const agent3 = new Moringa((msg) => {
    console.log('Agent3 says:', msg);
}, 'testbot3');
const result3 = agent3.merge(script3, 'testbot3');
console.log('Merge result:', result3);
console.log('Synonyms count:', agent3.model.testbot3.synonyms.length);

// Test the synonym
console.log('\nTesting input "hi":');
agent3.input('hi', 'testbot3');