const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING TEST SEQUENCE INTERFERENCE ===\n');

// Memory Operations test (run first)
console.log('1. Running Memory Operations test:');
const memoryScript = `
Memories
    "python is a language"

recognizer "my name is [name]"
    remember "user name is [name]"
    say "Stored your name!"

recognizer "what is my name"
    recall "user name is [name]"
    say "Your name is [name]."

recognizer "what is [topic]"
    recall "[topic] is [description]"
    say "[topic] is [description]."
`;

const agent1 = new Moringa((message) => {
    console.log('Bot:', message);
}, 'test');

agent1.merge(memoryScript, 'test');
agent1.input('my name is Bob', 'test');

console.log('\nMemories after Memory test:');
agent1.model.test.memories.forEach((mem, i) => {
    console.log(`${i + 1}. Context: "${mem.context}", Memory: "${mem.memory}"`);
});

// Conditional Logic test (run second on same agent)
console.log('\n2. Now running Conditional Logic test on same agent:');

const conditionalScript = `
Memories
    "test condition"

recognizer "test condition"
    option if "test condition"
        say "Condition matched!"
    option
        say "Default response"
`;

agent1.merge(conditionalScript, 'test');

console.log('\nMemories after Conditional test merge:');
agent1.model.test.memories.forEach((mem, i) => {
    console.log(`${i + 1}. Context: "${mem.context}", Memory: "${mem.memory}"`);
});

console.log('\nTesting condition:');
agent1.input('test condition', 'test');