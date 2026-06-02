/**
 * Test script for the Enhanced Debugging System
 * Demonstrates all debugging features with realistic scenarios
 */

const { Moringa } = require('./moringa.js');
const { MoringaDebugger } = require('./moringa-debug.js');

console.log('='.repeat(60));
console.log('ENHANCED DEBUGGING SYSTEM DEMONSTRATION');
console.log('='.repeat(60));

// Test script with various features
const testScript = `
Memories
    "python is a programming language"

recognizer "hello"
    say "Hello there!"

recognizer "my name is [name]"
    remember "user name is [name]"
    say "Nice to meet you, [name]!"

recognizer "I like [color:red,blue,green]"
    say "You chose [color]. Great choice!"

recognizer "what is my name"
    recall "user name is [name]"
    say "Your name is [name]."
`;

async function runDebugTests() {
    console.log('\n--- Setting up Moringa with Enhanced Debugging ---');

    const responses = [];
    const agent = new Moringa((message) => {
        responses.push(message);
    }, 'debug_test');

    // Initialize debugger
    const debug = new MoringaDebugger(agent);

    // Configure debugging
    console.log('\n--- Configuring Debug Settings ---');
    debug.setDebugLevel('verbose');
    debug.setTraceOptions({
        patterns: true,
        memory: true,
        variables: true,
        contexts: true,
        performance: true
    });

    console.log('✅ Debug level set to: verbose');
    console.log('✅ All trace options enabled');

    // Load script
    try {
        agent.merge(testScript, 'debug_test');
        console.log('✅ Test script loaded successfully');
    } catch (error) {
        console.log('❌ Script failed to load:', error.message);
        return;
    }

    console.log('\n--- Running Debug Test Cases ---');

    // Test cases to demonstrate debugging features
    const testCases = [
        {
            description: 'Simple pattern matching',
            input: 'hello',
            expectedFeature: 'Basic recognizer matching'
        },
        {
            description: 'Variable capture and memory storage',
            input: 'my name is Alice',
            expectedFeature: 'Variable capture + memory operation'
        },
        {
            description: 'Choice variable validation',
            input: 'I like blue',
            expectedFeature: 'Choice variable processing'
        },
        {
            description: 'Invalid choice variable',
            input: 'I like purple',
            expectedFeature: 'Choice variable validation failure'
        },
        {
            description: 'Memory recall',
            input: 'what is my name',
            expectedFeature: 'Memory recall operation'
        }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        console.log(`\n${i + 1}. ${testCase.description}`);
        console.log(`   Input: "${testCase.input}"`);
        console.log(`   Expected feature: ${testCase.expectedFeature}`);

        responses.length = 0; // Clear previous responses
        agent.input(testCase.input, 'debug_test');

        if (responses.length > 0) {
            console.log(`   Output: "${responses[0]}"`);
        } else {
            console.log(`   Output: (No response)`);
        }

        // Small delay to separate test cases in logs
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n--- Debug Summary ---');
    const summary = debug.getDebugSummary();
    console.log('Total debug entries:', summary.totalEntries);
    console.log('Entries by level:', summary.entriesByLevel);
    console.log('Entries by category:', summary.entriesByCategory);

    if (summary.performanceMetrics.interpret) {
        console.log('Average interpretation time:', summary.performanceMetrics.interpret.duration + 'ms');
    }

    console.log('\n--- Advanced Debugging Features ---');

    // Demonstrate trace level debugging
    console.log('\nSwitching to TRACE level for detailed analysis...');
    debug.setDebugLevel('trace');

    responses.length = 0;
    agent.input('my name is Bob', 'debug_test');

    // Export debug history
    console.log('\n--- Exporting Debug Data ---');
    const exportFile = '/tmp/moringa_debug_export.json';
    debug.exportDebugHistory(exportFile);
    console.log(`Debug history exported to: ${exportFile}`);

    // Clear history
    debug.clearHistory();
    console.log('Debug history cleared');

    console.log('\n--- Debugging Levels Demo ---');
    debug.setDebugLevel('error');
    debug.error('This is an error message');
    debug.warn('This warning should not appear'); // Won't show due to level

    debug.setDebugLevel('info');
    debug.info('This is an info message');
    debug.verbose('This verbose message should not appear'); // Won't show due to level

    console.log('\n' + '='.repeat(60));
    console.log('ENHANCED DEBUGGING SYSTEM DEMONSTRATION COMPLETE');
    console.log('='.repeat(60));
}

// Run the tests
runDebugTests().catch(console.error);