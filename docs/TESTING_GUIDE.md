# Built-in Testing Framework Guide

The Moringa Testing Framework provides a comprehensive, easy-to-use testing system for validating conversational AI scripts. It includes a fluent DSL, automatic test discovery, performance benchmarking, and detailed reporting.

## Quick Start

```javascript
const { MoringaTestFramework } = require('./moringa-test-framework.js');

// Initialize the testing framework
const testFramework = new MoringaTestFramework();

// Your MoringaScript to test
const script = `
recognizer "hello"
    say "Hello there!"

recognizer "my name is [name]"
    remember "user name is [name]"
    say "Nice to meet you, [name]!"
`;

// Write tests using the DSL
testFramework.describe('Basic Communication', () => {

    testFramework.it('should respond to greetings', () => {
        const ctx = testFramework.createTestContext(script);
        ctx.input('hello').shouldRespond('Hello there!');
    });

    testFramework.it('should capture user names', () => {
        const ctx = testFramework.createTestContext(script);
        ctx.input('my name is Alice')
            .shouldRespond('Nice to meet you, Alice!')
            .shouldHaveVariable('name', 'Alice');
    });

});

// Run all tests
testFramework.runTests();
```

## Test Framework API

### Test Organization

#### `describe(name, callback)`

Creates a test suite for organizing related tests:

```javascript
testFramework.describe('User Authentication', () => {
    // Tests go here
});
```

#### `it(description, testFunction)`

Creates an individual test:

```javascript
testFramework.it('should validate user credentials', () => {
    // Test implementation
});
```

### Test Context

#### `createTestContext(script, modelName)`

Creates a test context with a fresh Moringa agent:

```javascript
const ctx = testFramework.createTestContext(myScript, 'test_model');
```

Returns a context object with:
- `agent` - The Moringa agent instance
- `debug` - The debugging interface (silent during tests)
- `responses` - Array of bot responses
- `input(message)` - Send input and get assertion interface

### Fluent Assertion API

#### Basic Response Assertions

```javascript
// Test that bot responds with exact text
ctx.input('hello').shouldRespond('Hello there!');

// Test that bot doesn't respond
ctx.input('unknown').shouldNotRespond();

// Test that response contains specific text
ctx.input('help').shouldContain('assistance');
```

#### Variable Assertions

```javascript
// Test that a variable is set
ctx.input('my name is Bob').shouldHaveVariable('name');

// Test that a variable has a specific value
ctx.input('my name is Bob').shouldHaveVariable('name', 'Bob');
```

#### Memory Assertions

```javascript
// Test that a memory is stored
ctx.input('remember this').shouldHaveMemory('important fact');
```

#### Context Assertions

```javascript
// Test that agent is in a specific context
ctx.input('enter admin mode').shouldBeInContext('admin');
```

#### Performance Assertions

```javascript
// Test that response comes within time limit
ctx.input('quick command').shouldRespondWithin(50); // 50ms
```

### Test Context Utilities

#### Memory Manipulation

```javascript
// Pre-load memory for testing
ctx.setMemory('user is authenticated');

// Test with existing memory
ctx.input('what is my status').shouldContain('authenticated');
```

#### Context Manipulation

```javascript
// Activate a context for testing
ctx.activateContext('admin_mode');

// Test context-specific behavior
ctx.input('admin command').shouldRespond('Admin response');

// Deactivate context
ctx.deactivateContext('admin_mode');
```

### Chaining Assertions

Assertions can be chained for comprehensive testing:

```javascript
ctx.input('my name is Alice')
    .shouldRespond('Nice to meet you, Alice!')
    .shouldHaveVariable('name', 'Alice')
    .shouldHaveMemory('user name is Alice')
    .shouldRespondWithin(100);
```

## Running Tests

### Basic Execution

```javascript
// Run all tests with default options
await testFramework.runTests();
```

### Configuration Options

```javascript
await testFramework.runTests({
    timeout: 5000,        // Test timeout in ms
    verbose: true,        // Show detailed error messages
    coverage: true,       // Generate coverage report
    performance: true     // Generate performance report
});
```

### Test Output

```
🧪 Moringa Test Framework
==================================================

📦 Basic Communication
  ✅ should respond to greetings (5ms)
  ✅ should handle unknown inputs (3ms)

📦 User Management
  ✅ should store user names (8ms)
  ✅ should recall stored information (12ms)

📊 Test Results
==================================================
Tests:       4
Passed:      4
Failed:      0
Success:     100%
Duration:    28ms

⚡ Performance Report
==================================================
Average test time: 7ms

📄 Results exported to test_results.json
```

## Advanced Features

### Performance Testing

Test response times and identify slow operations:

```javascript
testFramework.describe('Performance', () => {
    
    testFramework.it('should handle simple patterns quickly', () => {
        const ctx = testFramework.createTestContext(script);
        ctx.input('hello').shouldRespondWithin(10);
    });

    testFramework.it('should handle complex memory operations efficiently', () => {
        const ctx = testFramework.createTestContext(script);
        
        // Set up complex memory state
        for (let i = 0; i < 100; i++) {
            ctx.setMemory(`fact ${i} is interesting`);
        }
        
        // Test recall performance
        ctx.input('what is fact 50')
            .shouldRespondWithin(50)
            .shouldContain('interesting');
    });

});
```

### Error Condition Testing

Test how your script handles edge cases:

```javascript
testFramework.describe('Error Handling', () => {

    testFramework.it('should handle empty input gracefully', () => {
        const ctx = testFramework.createTestContext(script);
        ctx.input('').shouldNotRespond();
    });

    testFramework.it('should handle very long input', () => {
        const ctx = testFramework.createTestContext(script);
        const longInput = 'x'.repeat(10000);
        ctx.input(longInput).shouldNotRespond();
    });

    testFramework.it('should reject invalid choice variables', () => {
        const ctx = testFramework.createTestContext(choiceScript);
        ctx.input('I like purple').shouldNotRespond(); // purple not in choices
    });

});
```

### Multi-Step Conversation Testing

Test complex conversation flows:

```javascript
testFramework.it('should handle multi-step authentication', () => {
    const ctx = testFramework.createTestContext(authScript);
    
    // Step 1: Start authentication
    ctx.input('login').shouldRespond('Please enter your username:');
    
    // Step 2: Provide username
    ctx.input('alice').shouldRespond('Please enter your password:');
    
    // Step 3: Provide password
    ctx.input('secret123')
        .shouldRespond('Welcome, alice!')
        .shouldBeInContext('authenticated')
        .shouldHaveVariable('username', 'alice');
});
```

### Choice Variable Testing

Test all choice combinations:

```javascript
const choiceScript = `
recognizer "I like [color:red,blue,green]"
    say "You chose [color]!"
`;

testFramework.describe('Choice Variables', () => {
    
    const validChoices = ['red', 'blue', 'green'];
    const invalidChoices = ['purple', 'yellow', 'orange'];
    
    validChoices.forEach(color => {
        testFramework.it(`should accept ${color}`, () => {
            const ctx = testFramework.createTestContext(choiceScript);
            ctx.input(`I like ${color}`)
                .shouldRespond(`You chose ${color}!`)
                .shouldHaveVariable('color', color);
        });
    });
    
    invalidChoices.forEach(color => {
        testFramework.it(`should reject ${color}`, () => {
            const ctx = testFramework.createTestContext(choiceScript);
            ctx.input(`I like ${color}`).shouldNotRespond();
        });
    });

});
```

## Test Results and Reporting

### JSON Export

Test results are automatically exported to JSON for further analysis:

```json
{
  "timestamp": "2026-06-01T23:40:39.839Z",
  "summary": {
    "passed": 18,
    "failed": 0,
    "skipped": 0,
    "total": 18
  },
  "performance": {
    "totalTests": 18,
    "totalDuration": 87,
    "averageDuration": 5,
    "slowTests": []
  },
  "coverage": {
    "recognizers": ["hello", "my name is [name]"],
    "contexts": ["general", "admin"],
    "actions": ["say", "remember"],
    "conditions": []
  },
  "errors": []
}
```

### Performance Metrics

The framework tracks:
- **Total test duration**
- **Average test time**
- **Slow tests** (>100ms flagged)
- **Individual test timings**

### Coverage Analysis

Tracks which script elements were exercised:
- **Recognizers tested** - Which patterns were matched
- **Contexts tested** - Which contexts were activated
- **Actions tested** - Which actions were executed
- **Conditions tested** - Which conditional logic was evaluated

## Best Practices

### 1. Organize Tests by Feature

```javascript
// Group related functionality
testFramework.describe('User Management', () => {
    // All user-related tests
});

testFramework.describe('Shopping Cart', () => {
    // All cart-related tests
});
```

### 2. Use Descriptive Test Names

```javascript
// Good: Describes the expected behavior
testFramework.it('should store user name in memory after introduction', () => {

// Bad: Vague or unclear
testFramework.it('test name storage', () => {
```

### 3. Test Edge Cases

```javascript
testFramework.describe('Edge Cases', () => {
    
    testFramework.it('should handle empty variable values', () => {
        const ctx = testFramework.createTestContext(script);
        ctx.input('my name is ').shouldNotRespond();
    });
    
    testFramework.it('should handle special characters in variables', () => {
        const ctx = testFramework.createTestContext(script);
        ctx.input('my name is João').shouldHaveVariable('name', 'João');
    });

});
```

### 4. Performance Testing

```javascript
// Test critical path performance
testFramework.it('should handle user authentication quickly', () => {
    const ctx = testFramework.createTestContext(script);
    ctx.input('login admin password123').shouldRespondWithin(50);
});
```

### 5. Use Setup and Teardown

```javascript
testFramework.describe('Authenticated User Tests', () => {
    
    testFramework.it('should access admin features when authenticated', () => {
        const ctx = testFramework.createTestContext(script);
        
        // Setup: authenticate user
        ctx.setMemory('user is authenticated');
        ctx.activateContext('authenticated');
        
        // Test: admin command should work
        ctx.input('admin status').shouldRespond('Admin access granted');
    });

});
```

## Integration with Development Workflow

### Continuous Testing

```javascript
// test_runner.js
const { MoringaTestFramework } = require('./moringa-test-framework.js');

async function runAllTests() {
    const framework = new MoringaTestFramework();
    
    // Load test files
    require('./tests/basic.test.js')(framework);
    require('./tests/advanced.test.js')(framework);
    require('./tests/performance.test.js')(framework);
    
    const results = await framework.runTests({
        timeout: 10000,
        verbose: process.env.VERBOSE === 'true',
        coverage: true,
        performance: true
    });
    
    if (results.failed > 0) {
        process.exit(1);
    }
}

runAllTests().catch(console.error);
```

### NPM Scripts Integration

```json
{
  "scripts": {
    "test": "node test_runner.js",
    "test:verbose": "VERBOSE=true node test_runner.js",
    "test:performance": "node test_runner.js --performance-only"
  }
}
```

## Testing Complex Scenarios

### State Management

```javascript
testFramework.it('should maintain state across conversation turns', () => {
    const ctx = testFramework.createTestContext(gameScript);
    
    // Start game
    ctx.input('start game').shouldRespond('Game started!');
    
    // Make move
    ctx.input('move north')
        .shouldContain('You moved north')
        .shouldHaveVariable('location', 'north_room');
    
    // Check inventory
    ctx.input('inventory')
        .shouldContain('You have: ')
        .shouldHaveVariable('location', 'north_room'); // State preserved
});
```

### Context Switching

```javascript
testFramework.it('should handle complex context transitions', () => {
    const ctx = testFramework.createTestContext(multiContextScript);
    
    // Start in general context
    ctx.input('general command').shouldRespond('General response');
    
    // Enter admin context
    ctx.input('admin mode')
        .shouldRespond('Entering admin mode')
        .shouldBeInContext('admin');
    
    // Admin-specific command
    ctx.input('system status').shouldRespond('System OK');
    
    // Exit admin context
    ctx.input('exit admin')
        .shouldRespond('Exiting admin mode')
        .shouldNotBeInContext('admin');
    
    // Back to general
    ctx.input('general command').shouldRespond('General response');
});
```

The Built-in Testing Framework makes it easy to ensure your Moringa scripts work correctly, perform well, and handle edge cases gracefully. Use it to build confidence in your conversational AI implementations!