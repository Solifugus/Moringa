#!/usr/bin/node

const { Moringa } = require('./moringa.js');

let messages = [];
const agent = new Moringa((msg) => {
    console.log('Agent says:', msg);
    messages.push(msg);
}, 'testbot');

console.log('Testing condition evaluation with debugging...');

// Replicate the exact test setup
const script = `
    recognizer "i am [feeling]"
        remember "[feeling] is a feeling"
        option if "[feeling] is positive"
            say "That's wonderful!"
        option if "[feeling] is negative"
            say "I'm sorry to hear that."
        option if not "[feeling] is positive" and not "[feeling] is negative"
            say "Is [feeling] a positive or negative feeling?"
`;
agent.merge(script, 'testbot');

agent.merge(`
    Memories
        "happy is positive"
        "sad is negative"
        "excited is positive"
`, 'testbot');

// Debug the isConditionTrue method
const originalIsConditionTrue = agent.isConditionTrue;
agent.isConditionTrue = function(condition, model) {
    console.log('  Checking condition:', condition);
    const result = originalIsConditionTrue.call(this, condition, model);
    console.log('  Condition result:', result);
    return result;
};

console.log('\nMemories:');
agent.model.testbot.memories.forEach((mem, i) => {
    console.log(`${i}: ${mem.memory}`);
});

console.log('\nTesting "i am sad":');
messages = [];
agent.input('i am sad', 'testbot');
console.log('Final messages:', messages);