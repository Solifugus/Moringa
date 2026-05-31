#!/usr/bin/node

const { Moringa } = require('./moringa.js');

let messages = [];
const agent = new Moringa((msg) => {
    console.log('Agent says:', msg);
    messages.push(msg);
}, 'testbot');

const script = `
    Memories
        "happy is positive"
        "sad is negative"
        "excited is positive"

    recognizer "i am [feeling]"
        remember "[feeling] is a feeling"
        option if "[feeling] is positive"
            say "That's wonderful!"
        option if "[feeling] is negative"
            say "I'm sorry to hear that."
        option if not "[feeling] is positive" and not "[feeling] is negative"
            say "Is [feeling] a positive or negative feeling?"
`;

console.log('Testing condition evaluation...');

agent.merge(script, 'testbot');

console.log('\nMemories after merge:');
agent.model.testbot.memories.forEach((mem, i) => {
    console.log(`${i}: ${mem.memory}`);
});

console.log('\nTesting "i am sad":');
messages = [];
agent.input('i am sad', 'testbot');
console.log('Messages:', messages);

console.log('\nTesting "i am happy":');
messages = [];
agent.input('i am happy', 'testbot');
console.log('Messages:', messages);