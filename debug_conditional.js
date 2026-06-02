const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING CONDITIONAL LOGIC ===\n');

const conditionalScript = `
Memories
    "test condition"
    "user is happy"

recognizer "test condition"
    option if "test condition"
        say "Condition matched!"
    option
        say "Default response"

recognizer "test memory [item]"
    option if "[item]"
        say "Found [item] in memory!"
    option
        say "No memory of [item]"

recognizer "test user happy"
    option if "user is happy"
        say "User is happy!"
    option
        say "User state unknown"
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'conditional_debug');

agent.merge(conditionalScript, 'conditional_debug');

console.log('Current memories:');
const model = agent.model.conditional_debug;
model.memories.forEach((mem, i) => {
    console.log(`${i + 1}. Context: "${mem.context}", Memory: "${mem.memory}"`);
});

console.log('\nTesting basic condition:');
agent.input('test condition', 'conditional_debug');

console.log('\nTesting variable condition:');
agent.input('test memory test condition', 'conditional_debug');

console.log('\nTesting complex memory condition:');
agent.input('test user happy', 'conditional_debug');