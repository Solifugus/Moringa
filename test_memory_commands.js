const { Moringa } = require('./moringa.js');

console.log('=== TESTING MEMORY COMMANDS ===\n');

const memoryScript = `
Memories
	"python is a language"
	"javascript is for web"

recognizer "remember [fact]"
	remember "[fact]"
	say "I'll remember [fact]"

recognizer "what is [topic]"
	recall "[topic] is [description]"
	say "[topic] is [description]"

recognizer "my name is [name]"
	remember "user name is [name]"
	say "Hello [name]!"

recognizer "what is my name"
	recall "user name is [name]"
	say "Your name is [name]"

recognizer "forget [topic]"
	forget "[topic]"
	say "I forgot [topic]"
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'memory_test');

agent.merge(memoryScript, 'memory_test');

function showMemories() {
    console.log('\n--- Current Memories ---');
    const memories = agent.model.memory_test.memories;
    memories.forEach((mem, i) => {
        console.log(`${i + 1}. ${mem.context}: ${mem.memory}`);
    });
    console.log('');
}

console.log('Initial memories:');
showMemories();

console.log('Testing pre-loaded memory recall:');
agent.input('what is python', 'memory_test');

console.log('\nTesting new memory storage:');
agent.input('my name is Alice', 'memory_test');
showMemories();

console.log('Testing memory recall:');
agent.input('what is my name', 'memory_test');

console.log('\nTesting manual remember:');
agent.input('remember cats are cute', 'memory_test');
showMemories();

console.log('Testing manual recall:');
agent.input('what is cats', 'memory_test');

console.log('\nTesting forget:');
agent.input('forget user name', 'memory_test');
showMemories();

console.log('Testing recall after forget:');
agent.input('what is my name', 'memory_test');

console.log('\n✅ Memory command tests completed!');