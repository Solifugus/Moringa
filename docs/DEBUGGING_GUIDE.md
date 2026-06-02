# Enhanced Debugging Guide for Moringa

The Enhanced Debugging System provides comprehensive visibility into Moringa's decision-making process, making it easy to understand how patterns are matched, variables are captured, and memory operations are performed.

## Quick Start

```javascript
const { Moringa } = require('./moringa.js');
const { MoringaDebugger } = require('./moringa-debug.js');

// Create your agent
const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'my_bot');

// Initialize debugging
const debug = new MoringaDebugger(agent);

// Configure debug level
debug.setDebugLevel('verbose');

// Load your script and start debugging
agent.merge(myScript, 'my_bot');
agent.input('hello world', 'my_bot');
```

## Debug Levels

The debugging system supports multiple levels of detail:

| Level | Description | Shows |
|-------|-------------|-------|
| `off` | No debug output | Nothing |
| `error` | Only errors | Critical issues |
| `warn` | Warnings and errors | Potential problems |
| `info` | General information | High-level operations |
| `verbose` | Detailed information | Pattern matches, variable substitution |
| `trace` | Maximum detail | Step-by-step pattern matching, full data |

### Setting Debug Level

```javascript
// Set debug level
debug.setDebugLevel('verbose');

// Available levels: 'off', 'error', 'warn', 'info', 'verbose', 'trace'
```

## Trace Categories

You can enable/disable specific debugging categories:

```javascript
debug.setTraceOptions({
    patterns: true,      // Pattern matching trace
    memory: true,        // Memory operations
    variables: true,     // Variable substitution
    contexts: true,      // Context switching
    performance: true    // Performance timing
});
```

## Debugging Features

### 1. Pattern Matching Trace

Shows how input messages are matched against recognizers:

```
[INFO] Pattern Match Attempt
  Input: "my name is Alice"
  Pattern: ["my name is [name]"]
  Context: general
  Matched: true

[VERBOSE] Pattern Match Success
  Variables: { name: [{ value: "Alice", timeStamp: "..." }] }
  Recognizer: ["my name is [name]"]
```

### 2. Variable Substitution Debugging

Traces how variables are substituted into output patterns:

```
[VERBOSE] Variable Substitution
  Original Pattern: "Hello [name]!"
  Available Variables: ["name"]
  Result: "Hello Alice!"

[TRACE] Variable [name] substituted with: Alice
```

### 3. Memory Operation Logging

Monitors memory storage and recall operations:

```
[INFO] Memory remember
  Params: { pattern: "user name is Alice" }
  Result: Success

[VERBOSE] Memory Recall
  Search Pattern: "user name is [name]"
  Total Memories: 5
  Matches: [{ memory: "user name is Alice", score: 1.0 }]
```

### 4. Choice Variable Validation

Tracks validation of choice variables:

```
[VERBOSE] Choice Variable Validation
  Variable: color
  Value: blue
  Allowed Choices: ["red", "blue", "green"]
  Is Valid: true
```

### 5. Context Switching Visualization

Shows when contexts are activated/deactivated:

```
[INFO] Context Switch
  From: general
  To: game_mode
  Trigger: "enter game"
```

### 6. Performance Profiling

Measures timing of operations:

```
[VERBOSE] Performance: interpret took 2ms
```

## Debug History and Export

### Viewing Debug Summary

```javascript
const summary = debug.getDebugSummary();
console.log('Total entries:', summary.totalEntries);
console.log('By level:', summary.entriesByLevel);
console.log('By category:', summary.entriesByCategory);
```

### Exporting Debug Data

```javascript
// Export to file
debug.exportDebugHistory('debug_session.json');

// Get data object
const debugData = debug.exportDebugHistory();
```

The exported JSON contains:
- Complete debug history with timestamps
- Debug configuration settings
- Performance metrics
- Summary statistics

### Clearing Debug History

```javascript
debug.clearHistory();
```

## Common Debugging Workflows

### 1. Troubleshooting Pattern Matching

When a recognizer isn't matching:

```javascript
// Set verbose level to see pattern attempts
debug.setDebugLevel('verbose');
debug.setTraceOptions({ patterns: true });

agent.input('your input here', 'model_name');

// Look for "Pattern Match Failed" messages
// Check if pattern syntax is correct
// Verify variable names match
```

### 2. Debugging Variable Issues

When variables show "(unknown)":

```javascript
// Enable variable and pattern tracing
debug.setTraceOptions({ 
    patterns: true, 
    variables: true 
});
debug.setDebugLevel('trace');

agent.input('test input', 'model_name');

// Check "Segment Matching" for variable capture
// Look for "Variable Substitution" messages
// Verify variable names are consistent
```

### 3. Memory Operation Issues

When memory recall isn't working:

```javascript
// Enable memory tracing
debug.setTraceOptions({ memory: true });
debug.setDebugLevel('verbose');

agent.input('recall test', 'model_name');

// Check "Memory Recall" for search results
// Verify pattern matching in memory operations
// Look for scoring and match details
```

### 4. Performance Analysis

To identify slow operations:

```javascript
// Enable performance tracking
debug.setTraceOptions({ performance: true });
debug.setDebugLevel('verbose');

// Run your test cases
// Check performance metrics in summary
const summary = debug.getDebugSummary();
console.log(summary.performanceMetrics);
```

## Advanced Usage

### Custom Debug Categories

You can add custom logging to your scripts:

```javascript
// In your custom actions
debug.info('Custom operation started', { data: 'value' });
debug.verbose('Detailed step completed', { step: 1 });
debug.trace('Fine-grained detail', { internal: 'state' });
```

### Integration with Testing

Use debugging in your test suites:

```javascript
// test_with_debug.js
const debug = new MoringaDebugger(agent);
debug.setDebugLevel('error'); // Only show errors in tests

// Run tests
runTestSuite();

// Export debug data for analysis
debug.exportDebugHistory('test_debug_results.json');
```

### Production Debugging

For production troubleshooting:

```javascript
// Enable minimal debugging
debug.setDebugLevel('warn');
debug.setTraceOptions({
    patterns: false,
    memory: true,     // Track memory issues
    variables: false,
    contexts: true,   // Track context problems
    performance: true // Monitor performance
});
```

## Debugging Output Examples

### Successful Pattern Match (Verbose Level)
```
[INFO] Starting interpretation
  Data: { message: "hello", modelName: "test" }

[INFO] Pattern Match Attempt
  Data: { input: "hello", pattern: ["hello"], context: "general", matched: true }

[VERBOSE] Variable Substitution
  Data: { originalPattern: "Hello there!", availableVariables: [], result: "Hello there!" }

[VERBOSE] Performance: interpret took 1ms

[INFO] Interpretation complete
  Data: { matched: true, recognizer: ["hello"], variablesCollected: 0, optionsAvailable: 0 }
```

### Failed Pattern Match (Trace Level)
```
[TRACE] Segment 0 Matching
  Data: { matchers: ["hello"], actuals: ["goodbye"], variablesSoFar: [] }

[INFO] Pattern Match Attempt
  Data: { input: "goodbye", pattern: ["hello"], context: "general", matched: false }

[INFO] Interpretation complete
  Data: { matched: false, recognizer: false, variablesCollected: 0, optionsAvailable: 0 }
```

## Tips and Best Practices

1. **Start with 'info' level** - Most issues are visible at this level
2. **Use 'trace' level sparingly** - Only when you need step-by-step analysis
3. **Enable specific categories** - Focus on the area you're debugging
4. **Export debug sessions** - Keep records of complex debugging sessions
5. **Monitor performance** - Watch for operations taking too long
6. **Clear history regularly** - Prevent memory buildup in long sessions

## Troubleshooting the Debugger

If debugging isn't working:

1. **Check integration**: Ensure `MoringaDebugger` is properly instantiated
2. **Verify debug level**: Make sure it's not set to 'off'
3. **Check trace options**: Ensure relevant categories are enabled
4. **Look for hooks**: Verify the debugger is hooking into Moringa methods

The Enhanced Debugging System makes Moringa development transparent and predictable, helping you quickly identify and fix issues in your conversational AI scripts.