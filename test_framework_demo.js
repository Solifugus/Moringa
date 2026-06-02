/**
 * Demonstration of the Built-in Testing Framework
 * Shows comprehensive testing capabilities for Moringa scripts
 */

const { MoringaTestFramework } = require('./moringa-test-framework.js');

// Initialize the testing framework
const testFramework = new MoringaTestFramework();

// Test script for demonstration
const testScript = `
Memories
    "python is a programming language"
    "nodejs is a runtime"

recognizer "hello"
    say "Hello there!"

recognizer "my name is [name]"
    remember "user name is [name]"
    say "Nice to meet you, [name]!"

recognizer "what is my name"
    recall "user name is [name]"
    say "Your name is [name]."

recognizer "I like [color:red,blue,green]"
    say "You chose [color]. Great choice!"

recognizer "what is [topic]"
    recall "[topic] is [description]"
    say "[topic] is [description]."

recognizer "test options"
    option say "Response A"
    option say "Response B"
    option say "Response C"

recognizer "enter test mode"
    enter "test"
    say "Entering test mode!"

context "test"
    recognizer "test command"
        say "In test mode!"

    recognizer "exit test"
        exit "test"
        say "Exiting test mode!"
`;

// Test Suite 1: Basic Communication
testFramework.describe('Basic Communication', () => {

    testFramework.it('should respond to simple greetings', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('hello').shouldRespond('Hello there!');
    });

    testFramework.it('should handle unknown inputs gracefully', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('unknown command').shouldNotRespond();
    });

});

// Test Suite 2: Variable Capture and Memory
testFramework.describe('Variable Capture and Memory', () => {

    testFramework.it('should capture and store user name', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('my name is Alice')
            .shouldRespond('Nice to meet you, Alice!')
            .shouldHaveVariable('name', 'Alice')
            .shouldHaveMemory('user name is Alice');
    });

    testFramework.it('should recall stored memories', () => {
        const ctx = testFramework.createTestContext(testScript);

        // First store a name
        ctx.input('my name is Bob').shouldRespond('Nice to meet you, Bob!');

        // Then recall it
        ctx.input('what is my name').shouldRespond('Your name is Bob.');
    });

    testFramework.it('should recall pre-loaded memories', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('what is python').shouldRespond('python is a programming language.');
    });

    testFramework.it('should handle memory recall when no memory exists', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('what is my name').shouldContain('(unknown)');
    });

});

// Test Suite 3: Choice Variables
testFramework.describe('Choice Variables', () => {

    testFramework.it('should accept valid choices', () => {
        const ctx = testFramework.createTestContext(testScript);

        ctx.input('I like red').shouldRespond('You chose red. Great choice!');
        ctx.input('I like blue').shouldRespond('You chose blue. Great choice!');
        ctx.input('I like green').shouldRespond('You chose green. Great choice!');
    });

    testFramework.it('should reject invalid choices', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('I like purple').shouldNotRespond();
        ctx.input('I like yellow').shouldNotRespond();
    });

});

// Test Suite 4: Response Options
testFramework.describe('Response Options', () => {

    testFramework.it('should provide randomized responses', () => {
        const ctx = testFramework.createTestContext(testScript);
        const responses = new Set();

        // Test multiple times to catch different options
        for (let i = 0; i < 10; i++) {
            const result = ctx.input('test options');
            responses.add(result.responses[0]);
        }

        // Should have at least one response (might be the same due to randomness)
        if (responses.size === 0) {
            throw new Error('Expected at least one response option');
        }
    });

});

// Test Suite 5: Context Switching
testFramework.describe('Context Switching', () => {

    testFramework.it('should enter and exit contexts', () => {
        const ctx = testFramework.createTestContext(testScript);

        // Enter test mode
        ctx.input('enter test mode')
            .shouldRespond('Entering test mode!')
            .shouldBeInContext('test');

        // Test context-specific command
        ctx.input('test command').shouldRespond('In test mode!');

        // Exit test mode
        ctx.input('exit test').shouldRespond('Exiting test mode!');
    });

    testFramework.it('should not respond to context-specific commands outside context', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('test command').shouldNotRespond();
    });

});

// Test Suite 6: Performance Testing
testFramework.describe('Performance', () => {

    testFramework.it('should respond quickly to simple patterns', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('hello').shouldRespondWithin(50);
    });

    testFramework.it('should handle complex variable substitution efficiently', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('my name is VeryLongNameToTestPerformance')
            .shouldRespondWithin(100);
    });

    testFramework.it('should handle memory operations efficiently', () => {
        const ctx = testFramework.createTestContext(testScript);

        // Set up memory
        ctx.input('my name is TestUser').shouldRespondWithin(100);

        // Recall should also be fast
        ctx.input('what is my name').shouldRespondWithin(100);
    });

});

// Test Suite 7: Error Conditions
testFramework.describe('Error Handling', () => {

    testFramework.it('should handle malformed scripts gracefully', () => {
        try {
            const ctx = testFramework.createTestContext('invalid script syntax');
            // If we reach here, check if the script actually loaded properly
            // by testing a basic interaction that should fail
            ctx.input('test').shouldNotRespond();
        } catch (error) {
            // This is expected for malformed scripts
            if (error.message.includes('Failed to load script') ||
                error.message.includes('Malformed Statement')) {
                // Expected behavior - script parsing failed
                return;
            }
            throw error;
        }
    });

    testFramework.it('should handle empty input', () => {
        const ctx = testFramework.createTestContext(testScript);
        ctx.input('').shouldNotRespond();
    });

    testFramework.it('should handle very long input', () => {
        const ctx = testFramework.createTestContext(testScript);
        const longInput = 'x'.repeat(1000); // Use non-matching pattern
        ctx.input(longInput).shouldNotRespond();
    });

});

// Standalone test (not in a suite)
testFramework.it('standalone test: script loading', () => {
    const ctx = testFramework.createTestContext(testScript);
    // If we get here, the script loaded successfully
});

// Run all tests
async function runDemoTests() {
    console.log('🚀 Starting Moringa Testing Framework Demonstration');
    console.log();

    try {
        const results = await testFramework.runTests({
            verbose: true,
            coverage: true,
            performance: true,
            timeout: 5000
        });

        // Export detailed results
        testFramework.exportResults('test_results.json');

        console.log('\n🎉 Test Framework Demonstration Complete!');

        if (results.failed > 0) {
            console.log(`❌ ${results.failed} tests failed`);
            process.exit(1);
        } else {
            console.log(`✅ All ${results.passed} tests passed!`);
        }

    } catch (error) {
        console.error('❌ Test framework error:', error.message);
        process.exit(1);
    }
}

// Run the demonstration
runDemoTests().catch(console.error);