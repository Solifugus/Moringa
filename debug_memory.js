const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING MEMORY RECALL ISSUE ===\n');

const memoryScript = `
Memories
    "python is a language"

recognizer "my name is [name]"
    remember "user name is [name]"
    say "Stored your name!"

recognizer "what is [topic]"
    recall "[topic] is [description]"
    say "[topic] is [description]."

recognizer "list memories"
    say "Checking all memories..."
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'memory_debug');

agent.merge(memoryScript, 'memory_debug');

console.log('Setting up memories:');
agent.input('my name is Bob', 'memory_debug'); // This adds "user name is Bob"

console.log('\nCurrent memories:');
const model = agent.model.memory_debug;
model.memories.forEach((mem, i) => {
    console.log(`${i + 1}. Context: "${mem.context}", Memory: "${mem.memory}"`);
});

console.log('\nTesting memory recall:');
console.log('Query: "what is python"');
agent.input('what is python', 'memory_debug');

console.log('\nQuery: "what is user name"');
agent.input('what is user name', 'memory_debug');