const { Moringa } = require('./moringa.js');

console.log('=== TESTING SEQUENCES AND TIMING ===\n');

const sequenceScript = `
sequence "greeting"
	say "Hello there!"
	say "How are you doing?"
	say "What can I help you with?"

sequence "goodbye"
	say "Thanks for chatting!"
	say "Have a great day!"
	say "See you later!"

recognizer "test greeting"
	do "greeting"

recognizer "test goodbye"
	do "goodbye"

recognizer "test multiple sequences"
	do "greeting"
	do "goodbye"

recognizer "test delayed message"
	say "Immediate message"
	say "This appears after 2 seconds" in "2 seconds"

recognizer "test variable timing [duration] [unit]"
	say "Setting timer for [duration] [unit]"
	say "Timer done!" in "[duration] [unit]"

recognizer "test expectations"
	say "Do you like coffee? (yes or no)"
	expect "yes" as "I love coffee"
	expect "no" as "I hate coffee"

recognizer "I love coffee"
	say "Coffee is great!"

recognizer "I hate coffee"
	say "That's okay, tea is nice too!"
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'sequence_test');

agent.merge(sequenceScript, 'sequence_test');

console.log('Testing single sequence:');
agent.input('test greeting', 'sequence_test');

console.log('\nTesting another sequence:');
agent.input('test goodbye', 'sequence_test');

console.log('\nTesting multiple sequences in one recognizer:');
agent.input('test multiple sequences', 'sequence_test');

console.log('\nTesting delayed message (wait 3 seconds):');
agent.input('test delayed message', 'sequence_test');

console.log('\nTesting variable timing:');
agent.input('test variable timing 1 seconds', 'sequence_test');

console.log('\nTesting expectations:');
agent.input('test expectations', 'sequence_test');

console.log('\nTesting expectation response:');
agent.input('yes', 'sequence_test');

setTimeout(() => {
    console.log('\n--- Final delayed messages should appear above ---');
    console.log('✅ Sequences and timing tests completed!');

    console.log('\n--- Current Expectations ---');
    const expects = agent.model.sequence_test.expects;
    if (expects && expects.length > 0) {
        expects.forEach((exp, i) => {
            console.log(`${i + 1}. "${exp.phrase}" -> "${exp.interpretation}"`);
        });
    } else {
        console.log('No active expectations');
    }
}, 3500);