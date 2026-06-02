const fs = require('fs');
const { Moringa } = require('./moringa.js');

console.log('='.repeat(60));
console.log('COMPREHENSIVE MORINGA COMMAND TEST');
console.log('='.repeat(60));

// Test script with all commands
const testScript = `
Memories
	"python is a language"
	"javascript is for web"

Conjugate "I" And "you"
Conjugate "my" And "your"

synonyms "hello" : hi, hey, greetings

-- Basic communication
recognizer "test say"
	say "Say command works!"

recognizer "test multiple say"
	say "First message"
	say "Second message"

recognizer "test delayed say"
	say "Immediate message"
	say "Delayed message in 1 second" in "1 seconds"

-- Variable capture
recognizer "my name is [name]"
	say "Hello [name]!"
	remember "user name is [name]"

recognizer "I like [item]"
	say "You like [item]."
	remember "user likes [item]"

recognizer "I choose [color:red,blue,green]"
	say "You chose [color]."
	remember "user color is [color]"

-- Memory recall
recognizer "what is my name"
	recall "user name is [name]"
	say "Your name is [name]."

recognizer "what do I like"
	recall "user likes [item]"
	say "You like [item]."

recognizer "what is my color"
	recall "user color is [color]"
	say "Your color is [color]."

recognizer "what is [topic]"
	recall "[topic] is [description]"
	say "[topic] is [description]."

-- Response options
recognizer "test options"
	option say "Option A"
	option say "Option B"
	option say "Option C"

-- Conditional logic
recognizer "test condition"
	remember "user is happy"
	option if "user is happy":
		say "You are happy!"
	option:
		say "Default response"

recognizer "test always"
	always if "python is a language":
		say "Always condition: Python confirmed!"

-- Context tests
context "work"
	recognizer "work mode"
		say "In work context!"

recognizer "enter work"
	enter "work"
	say "Entering work context"

recognizer "exit work"
	exit "work"
	say "Exiting work context"

-- Sequence test
sequence "greeting"
	say "Hello!"
	say "How are you?"

recognizer "test sequence"
	do "greeting"

-- Forget test
recognizer "forget [topic]"
	forget "[topic]"
	say "Forgot [topic]"

-- Synonym test
recognizer "hello"
	say "Hello recognized (synonym test)!"
`;

// Create bot and load script
console.log('Creating Moringa agent...');
const responses = [];
const agent = new Moringa((message) => {
    responses.push(message);
    console.log('Bot:', message);
}, 'testbot');

console.log('Loading test script...');
try {
    agent.merge(testScript, 'testbot');
    console.log('✅ Script loaded successfully!');
} catch (error) {
    console.log('❌ Script loading failed:', error.message);
    process.exit(1);
}

// Test functions
function testCommand(input, description) {
    console.log(`\n--- Testing: ${description} ---`);
    console.log(`Input: "${input}"`);
    responses.length = 0; // Clear previous responses

    agent.input(input, 'testbot');

    if (responses.length > 0) {
        console.log('✅ Responses:', responses);
    } else {
        console.log('❌ No response received');
    }

    return responses.length > 0;
}

function showMemories() {
    console.log('\n--- Current Memories ---');
    const memories = agent.model.testbot.memories;
    if (memories && memories.length > 0) {
        memories.forEach((mem, i) => {
            console.log(`${i + 1}. ${mem.context}: ${mem.memory}`);
        });
    } else {
        console.log('No memories stored.');
    }
}

// Run systematic tests
console.log('\n' + '='.repeat(60));
console.log('STARTING SYSTEMATIC TESTS');
console.log('='.repeat(60));

const tests = [
    ['test say', 'Basic say command'],
    ['test multiple say', 'Multiple say commands'],
    ['my name is Alice', 'Variable capture and memory storage'],
    ['what is my name', 'Memory recall with variables'],
    ['I like pizza', 'Item preference storage'],
    ['what do I like', 'Item preference recall'],
    ['I choose red', 'Choice variable capture'],
    ['what is my color', 'Choice variable recall'],
    ['what is python', 'Pre-loaded memory recall'],
    ['test options', 'Response options'],
    ['test condition', 'Conditional logic'],
    ['test always', 'Always conditions'],
    ['enter work', 'Context entering'],
    ['work mode', 'Context-specific recognition'],
    ['exit work', 'Context exiting'],
    ['work mode', 'Context-specific recognition (after exit)'],
    ['test sequence', 'Sequence execution'],
    ['hello', 'Synonym recognition'],
    ['hi', 'Synonym recognition (alternative)'],
    ['forget user name', 'Memory forgetting'],
    ['what is my name', 'Recall after forgetting'],
    ['test delayed say', 'Delayed response (wait for it)']
];

let passedTests = 0;
let totalTests = tests.length;

for (const [input, description] of tests) {
    if (testCommand(input, description)) {
        passedTests++;
    }

    // Show memories after memory-related commands
    if (description.includes('memory') || description.includes('storage') || description.includes('forgetting')) {
        showMemories();
    }
}

// Wait for delayed messages
console.log('\n--- Waiting 3 seconds for delayed messages ---');
setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests`);

    if (passedTests === totalTests) {
        console.log('🎉 ALL TESTS PASSED! All MoringaScript commands working properly.');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
    }

    showMemories();
    console.log('\nTest completed!');
    process.exit(0);
}, 3000);