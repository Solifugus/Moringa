const { Moringa } = require('./moringa.js');

console.log('=== TESTING RESPONSE OPTIONS ===\n');

const optionsScript = `
recognizer "test options"
	option say "Response A"
	option say "Response B"
	option say "Response C"
	option say "Response D"

recognizer "test condition"
	remember "user is happy"
	option if "user is happy"
		say "You are happy!"
	option
		say "Default response"

recognizer "test always condition"
	always if "test fact"
		say "Always: Test fact exists"
	option say "Regular response"

recognizer "test negative condition"
	option if not "nonexistent fact"
		say "Negative condition works!"
	option
		say "This shouldn't appear"

recognizer "test open"
	option if "fake fact"
		say "This won't show"
	open
		say "Open fallback works!"

Memories
	"test fact"
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'options_test');

agent.merge(optionsScript, 'options_test');

console.log('Testing multiple options (run several times):');
for (let i = 0; i < 5; i++) {
    console.log(`\nTry ${i + 1}:`);
    agent.input('test options', 'options_test');
}

console.log('\n\nTesting conditional options:');
agent.input('test condition', 'options_test');

console.log('\nTesting always condition:');
agent.input('test always condition', 'options_test');

console.log('\nTesting negative condition:');
agent.input('test negative condition', 'options_test');

console.log('\nTesting open fallback:');
agent.input('test open', 'options_test');

console.log('\n✅ Response options tests completed!');