const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING MEMORY PATTERN ALIGNMENT ===\n');

const memoryScript = `
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

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'pattern_debug');

agent.merge(memoryScript, 'pattern_debug');

console.log('Storing memory:');
agent.input('my name is Bob', 'pattern_debug');

console.log('\nMemories stored:');
const model = agent.model.pattern_debug;
model.memories.forEach((mem, i) => {
    console.log(`${i + 1}. "${mem.memory}"`);
});

console.log('\nTesting specific recall:');
agent.input('what is my name', 'pattern_debug');

console.log('\nTesting variables after recall:');
const variables = model.awareness.variable;
for (let varName in variables) {
    console.log(`Variable "${varName}": ${variables[varName].map(v => v.value).join(', ')}`);
}