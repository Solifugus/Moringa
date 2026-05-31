#!/usr/bin/node

const { Moringa } = require('./moringa.js');

let messages = [];
const agent = new Moringa((msg) => {
    console.log('Agent says:', msg);
    messages.push(msg);
}, 'testbot');

console.log('Testing separate merge calls...');

// First merge - the recognizer
const script1 = `
    recognizer "i am [feeling]"
        remember "[feeling] is a feeling"
        option if "[feeling] is positive"
            say "That's wonderful!"
        option if "[feeling] is negative"
            say "I'm sorry to hear that."
        option if not "[feeling] is positive" and not "[feeling] is negative"
            say "Is [feeling] a positive or negative feeling?"
`;
agent.merge(script1, 'testbot');

// Second merge - the memories
const script2 = `
    Memories
        "happy is positive"
        "sad is negative"
        "excited is positive"
`;
agent.merge(script2, 'testbot');

console.log('\nMemories after both merges:');
agent.model.testbot.memories.forEach((mem, i) => {
    console.log(`${i}: ${mem.memory}`);
});

console.log('\nTesting "i am sad":');
messages = [];
agent.input('i am sad', 'testbot');
console.log('Messages:', messages);