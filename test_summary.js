const { Moringa } = require('./moringa.js');

console.log('='.repeat(60));
console.log('MORINGA COMMAND FUNCTIONALITY SUMMARY');
console.log('='.repeat(60));

// Test each command category systematically
const tests = [
    {
        name: 'Basic Communication',
        script: `
recognizer "test say"
    say "Say command works!"

recognizer "test multiple"
    say "First message"
    say "Second message"
        `,
        tests: [
            ['test say', 'Basic say command'],
            ['test multiple', 'Multiple say commands']
        ]
    },
    {
        name: 'Variable Capture',
        script: `
recognizer "my name is [name]"
    say "Hello [name]!"

recognizer "I like [item]"
    say "You like [item]."

recognizer "I choose [color:red,blue,green]"
    say "You chose [color]."
        `,
        tests: [
            ['my name is Alice', 'Variable capture'],
            ['I like pizza', 'Item variable'],
            ['I choose red', 'Choice variable']
        ]
    },
    {
        name: 'Memory Operations',
        script: `
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
        `,
        tests: [
            ['my name is Bob', 'Memory storage'],
            ['what is my name', 'Memory recall'],
            ['what is python', 'Pre-loaded memory']
        ]
    },
    {
        name: 'Response Options',
        script: `
recognizer "test random"
    option say "Response A"
    option say "Response B"
    option say "Response C"
        `,
        tests: [
            ['test random', 'Random response selection']
        ]
    },
    {
        name: 'Conditional Logic',
        script: `
Memories
    "test condition"

recognizer "test condition"
    option if "test condition"
        say "Condition matched!"
    option
        say "Default response"
        `,
        tests: [
            ['test condition', 'Conditional options']
        ]
    },
    {
        name: 'Sequences',
        script: `
sequence "demo"
    say "Step 1"
    say "Step 2"
    say "Step 3"

recognizer "test sequence"
    do "demo"
        `,
        tests: [
            ['test sequence', 'Sequence execution']
        ]
    },
    {
        name: 'Timing',
        script: `
recognizer "test timing"
    say "Immediate"
    say "Delayed by 1 second" in "1 seconds"
        `,
        tests: [
            ['test timing', 'Delayed messages']
        ]
    },
    {
        name: 'Context Switching',
        script: `
recognizer "context command"
    say "In general context!"

recognizer "enter test"
    enter "test_context"
    say "Entered test context"

recognizer "exit test"
    exit "test_context"
    say "Exited test context"

context "test_context"
    recognizer "context command"
        say "In test context!"
        `,
        tests: [
            ['context command', 'General context'],
            ['enter test', 'Enter context'],
            ['context command', 'Context-specific command'],
            ['exit test', 'Exit context'],
            ['context command', 'Back to general context']
        ]
    },
    {
        name: 'Conjugations',
        script: `
Conjugate "I" And "you"
Conjugate "my" And "your"

recognizer "I am happy"
    say "you are happy!"

recognizer "my car"
    say "your car!"
        `,
        tests: [
            ['I am happy', 'Pronoun conjugation'],
            ['my car', 'Possessive conjugation']
        ]
    }
];

async function runTest(category, script, testCases) {
    console.log(`\n--- ${category} ---`);

    const responses = [];
    const agent = new Moringa((message) => {
        responses.push(message);
    }, 'test');

    try {
        agent.merge(script, 'test');
        console.log('✅ Script loaded successfully');
    } catch (error) {
        console.log('❌ Script failed to load:', error.message);
        return;
    }

    for (const [input, description] of testCases) {
        responses.length = 0;
        agent.input(input, 'test');

        if (responses.length > 0) {
            console.log(`✅ ${description}: "${input}" → "${responses[0]}"`);
        } else {
            console.log(`❌ ${description}: "${input}" → No response`);
        }
    }
}

async function runAllTests() {
    for (const test of tests) {
        await runTest(test.name, test.script, test.tests);

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY COMPLETE - Check results above');
    console.log('='.repeat(60));
}

runAllTests();