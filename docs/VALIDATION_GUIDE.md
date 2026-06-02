# Script Validation & Linting Guide

The Moringa Script Validation & Linting system provides comprehensive code quality analysis for MoringaScript files. It identifies syntax errors, best practice violations, performance issues, and suggests improvements to make your conversational AI scripts more reliable and maintainable.

## Quick Start

```javascript
const { MoringaValidator } = require('./moringa-validator.js');

// Initialize validator
const validator = new MoringaValidator();

// Validate a script
const script = `
recognizer "hello"
    say "Hello there!"

recognizer "my name is [name]"
    remember "user name is [name]"
    say "Nice to meet you, [name]!"
`;

const report = validator.validate(script, {
    filePath: 'my_script.pgm'
});

// Print results
validator.printReport(report, { verbose: true });
```

## Validation Categories

### 1. Syntax Validation

Detects fundamental syntax errors that prevent script execution:

```javascript
// Missing quotes
recognizer hello          // ❌ Error: Expected quoted pattern
    say "Hi there!"

// Unmatched brackets  
recognizer "name is [name"  // ❌ Error: Unclosed bracket
    say "Hello [name]!"

// Missing required elements
recognizer "test"
    say                     // ❌ Error: Expected quoted message
```

**Detected Issues:**
- Missing quotes around patterns and messages
- Unmatched brackets in variable definitions
- Incomplete keyword usage
- Malformed script structure

### 2. Best Practice Checking

Identifies potential issues that might cause problems:

```javascript
// Poor naming conventions
context "User Management"        // ⚠️ Warning: Use snake_case or camelCase
recognizer "user [full name]"    // ⚠️ Warning: Avoid spaces in variables
    say "Hello [full name]!"

// Pattern design issues
recognizer "hi"                  // ⚠️ Warning: Pattern may be too generic
recognizer "this is a very very very long pattern that could be problematic"  // ⚠️ Warning: Pattern too specific
    say "Response"
```

**Best Practice Rules:**
- **Naming Conventions**: Consistent variable and context naming
- **Pattern Design**: Appropriate specificity and length
- **Memory Usage**: Reasonable number of stored memories
- **Variable Consistency**: Consistent variable naming across patterns
- **Context Organization**: Logical grouping of related recognizers

### 3. Performance Analysis

Identifies potential performance bottlenecks:

```javascript
// Too many variables in one pattern
recognizer "test [a] [b] [c] [d] [e] [f]"  // ⚠️ Warning: Too many variables (6)
    say "Response with [a] [b] [c] [d] [e] [f]"

// Very long patterns
recognizer "this is an extremely long pattern that exceeds reasonable limits and might slow down matching performance"  // ⚠️ Warning: Pattern too long

// Too many recognizers in one context  
context "main"
    // 60+ recognizers here  // ⚠️ Warning: Too many recognizers, consider splitting
```

**Performance Rules:**
- **Pattern Complexity**: Length and variable count limits
- **Recognizer Count**: Maximum recognizers per context
- **Memory Size**: Maximum number of memory entries
- **Variable Count**: Total unique variables across script

### 4. Unused Pattern Detection

Finds patterns that are defined but never referenced:

```javascript
recognizer "admin status"        // ⚠️ Warning: Pattern never used
    say "System OK"

recognizer "helper function"     // ⚠️ Warning: Pattern never used  
    say "This is never called"

// Referenced patterns are OK
recognizer "show help"
    say "Available commands: status, help"
    
sequence "welcome"
    do "show help"               // ✅ Pattern is used
```

### 5. Complexity Analysis

Measures script complexity and suggests improvements:

```javascript
// High complexity indicators:
// - Many recognizers (50+)
// - Many contexts (10+) 
// - Many variables (30+)
// - Deep nesting

// Complexity Score Calculation:
// - Recognizers × 1 point
// - Contexts × 2 points  
// - Variables × 0.5 points
// - Actions × 0.5 points

// Score > 100 = High complexity warning
```

### 6. Accessibility Checking

Ensures scripts are user-friendly:

```javascript
// Missing help system
// 10+ recognizers but no help pattern  // 💡 Suggestion: Add help recognizers

recognizer "help"               // ✅ Good: Provides user guidance  
    say "I can help with: greetings, names, colors"

// Missing error handling
// 10+ recognizers but no error patterns  // 💡 Suggestion: Add error handling

recognizer "I don't understand"  // ✅ Good: Handles errors gracefully
    say "Sorry, I didn't catch that. Try saying 'help'."
```

## Configuration Options

### Validation Rules

Enable/disable specific validation categories:

```javascript
const report = validator.validate(script, {
    rules: {
        syntax: true,           // Syntax error checking
        bestPractices: true,    // Best practice warnings
        performance: true,      // Performance analysis
        unused: true,           // Unused pattern detection
        complexity: true,       // Complexity analysis
        accessibility: true     // Accessibility suggestions
    }
});
```

### Custom Thresholds

Adjust sensitivity for performance and complexity checks:

```javascript
const report = validator.validate(script, {
    thresholds: {
        maxRecognizersPerContext: 25,    // Default: 50
        maxVariablesPerPattern: 3,       // Default: 5
        maxPatternLength: 60,            // Default: 100
        maxMemoryEntries: 500,           // Default: 1000
        maxNestingDepth: 5              // Default: 10
    }
});
```

### File Path and Metadata

Provide context for better error reporting:

```javascript
const report = validator.validate(script, {
    filePath: 'src/chatbot/greetings.pgm',
    rules: { performance: true },
    thresholds: { maxPatternLength: 50 }
});
```

## Validation Report

The validation report provides comprehensive analysis:

```javascript
{
    filePath: "my_script.pgm",
    isValid: true,                    // No syntax errors
    analysis: { /* detailed analysis */ },
    metrics: {
        recognizers: 15,
        contexts: 3,
        variables: 8,
        memories: 5,
        complexityScore: 23,
        unusedPatterns: ["admin_debug"]
    },
    issues: {
        errors: [],                   // Syntax errors
        warnings: [                   // Best practice violations  
            {
                type: "PERFORMANCE",
                message: "Pattern too long (85 chars)",
                line: 15,
                severity: "warning"
            }
        ],
        suggestions: [                // Improvement suggestions
            {
                type: "ACCESSIBILITY", 
                message: "Consider adding help recognizers",
                line: 1,
                severity: "suggestion"  
            }
        ],
        total: 3
    },
    summary: {
        recognizers: 15,
        contexts: 3,
        variables: 8,
        memories: 5,
        complexityScore: 23,
        qualityScore: 85              // 0-100 quality rating
    }
}
```

### Quality Score Calculation

The quality score (0-100) is calculated as:

- **Starting Score**: 100
- **Deductions**: 
  - Errors: -10 points each
  - Warnings: -5 points each  
  - Suggestions: -1 point each
- **Bonuses**:
  - Using contexts: +5 points
  - Using memory: +5 points
- **Final Score**: Clamped to 0-100 range

```javascript
// Examples:
// 95-100: Excellent - Well-structured, no issues
// 80-94:  Good - Minor improvements possible
// 60-79:  Fair - Some best practice violations
// 40-59:  Poor - Multiple issues to address
// 0-39:   Critical - Major problems, needs attention
```

## Command Line Usage

### Basic Validation

```bash
# Validate a single file
node -e "
const {MoringaValidator} = require('./moringa-validator.js');
const fs = require('fs');
const validator = new MoringaValidator();
const script = fs.readFileSync('my_script.pgm', 'utf8');
const report = validator.validate(script, {filePath: 'my_script.pgm'});
validator.printReport(report, {verbose: true});
"
```

### Batch Validation

```javascript
// validate_all.js
const { MoringaValidator } = require('./moringa-validator.js');
const fs = require('fs');
const path = require('path');

const validator = new MoringaValidator();

// Find all .pgm files
const scriptFiles = fs.readdirSync('scripts/')
    .filter(file => file.endsWith('.pgm'))
    .map(file => path.join('scripts', file));

console.log(`Validating ${scriptFiles.length} scripts...\n`);

let totalIssues = 0;
let invalidScripts = 0;

scriptFiles.forEach(filePath => {
    const script = fs.readFileSync(filePath, 'utf8');
    const report = validator.validate(script, { filePath });
    
    console.log(`📄 ${filePath}:`);
    console.log(`   Status: ${report.isValid ? '✅ Valid' : '❌ Invalid'}`);
    console.log(`   Quality: ${report.summary.qualityScore}/100`);
    console.log(`   Issues: ${report.issues.total}`);
    
    if (report.issues.total > 0) {
        totalIssues += report.issues.total;
        if (!report.isValid) invalidScripts++;
        
        // Show first few issues
        [...report.issues.errors, ...report.issues.warnings]
            .slice(0, 3)
            .forEach(issue => {
                console.log(`   • Line ${issue.line}: ${issue.message}`);
            });
    }
    console.log();
});

console.log(`\n📊 Summary:`);
console.log(`   Scripts: ${scriptFiles.length}`);
console.log(`   Invalid: ${invalidScripts}`);
console.log(`   Total Issues: ${totalIssues}`);
```

## Integration with Development Workflow

### Pre-commit Hook

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "🔍 Validating MoringaScript files..."

# Find staged .pgm files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep '\.pgm$')

if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

# Validate each file
for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ]; then
        echo "Validating $FILE..."
        node validate_script.js "$FILE"
        if [ $? -ne 0 ]; then
            echo "❌ Validation failed for $FILE"
            exit 1
        fi
    fi
done

echo "✅ All MoringaScript files validated successfully"
```

### CI/CD Pipeline

```yaml
# .github/workflows/validate.yml
name: Validate MoringaScripts

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
        
      - name: Validate MoringaScripts
        run: |
          find . -name "*.pgm" -exec node validate_script.js {} \;
          
      - name: Generate validation report
        run: node generate_validation_report.js > validation_report.json
        
      - name: Upload validation report
        uses: actions/upload-artifact@v2
        with:
          name: validation-report
          path: validation_report.json
```

### VS Code Integration

```json
// .vscode/tasks.json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Validate MoringaScript",
            "type": "shell", 
            "command": "node",
            "args": ["validate_script.js", "${file}"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            },
            "problemMatcher": {
                "owner": "moringa",
                "fileLocation": ["relative", "${workspaceFolder}"],
                "pattern": {
                    "regexp": "^Line (\\d+): (.*)$",
                    "file": 1,
                    "line": 1,
                    "message": 2
                }
            }
        }
    ]
}
```

## Advanced Usage

### Custom Validation Rules

Extend the validator with custom rules:

```javascript
class CustomMoringaValidator extends MoringaValidator {
    validateBestPractices(analysis) {
        super.validateBestPractices(analysis);
        
        // Add custom business logic validation
        this.checkBusinessLogic(analysis);
    }
    
    checkBusinessLogic(analysis) {
        // Example: Ensure all user data collection has privacy notice
        const dataCollectionPatterns = analysis.structure.recognizers
            .filter(rec => rec.pattern.includes('name') || rec.pattern.includes('email'));
            
        dataCollectionPatterns.forEach(rec => {
            // Check if privacy notice exists in the same context
            const hasPrivacyNotice = analysis.structure.recognizers
                .some(r => r.context === rec.context && r.pattern.includes('privacy'));
                
            if (!hasPrivacyNotice) {
                this.addWarning('BUSINESS_LOGIC',
                    `Data collection pattern should have privacy notice: "${rec.pattern}"`, rec.line);
            }
        });
    }
}
```

### Performance Profiling

Monitor validation performance for large scripts:

```javascript
const validator = new MoringaValidator();

console.time('validation');
const report = validator.validate(largeScript, {
    filePath: 'large_script.pgm'
});
console.timeEnd('validation');

console.log(`Validated ${largeScript.length} chars in ${performance.now()}ms`);
console.log(`Found ${report.summary.recognizers} recognizers, ${report.summary.variables} variables`);
console.log(`Quality score: ${report.summary.qualityScore}/100`);
```

### Metrics Tracking

Track validation metrics over time:

```javascript
// validation_metrics.js
const reports = [];

scriptFiles.forEach(file => {
    const script = fs.readFileSync(file, 'utf8');
    const report = validator.validate(script, { filePath: file });
    
    reports.push({
        file,
        timestamp: new Date().toISOString(),
        metrics: report.summary,
        issues: report.issues.total,
        isValid: report.isValid
    });
});

// Calculate trends
const avgQuality = reports.reduce((sum, r) => sum + r.metrics.qualityScore, 0) / reports.length;
const errorRate = reports.filter(r => !r.isValid).length / reports.length;
const totalIssues = reports.reduce((sum, r) => sum + r.issues, 0);

console.log(`📈 Validation Metrics:`);
console.log(`   Average Quality: ${Math.round(avgQuality)}/100`);
console.log(`   Error Rate: ${Math.round(errorRate * 100)}%`);
console.log(`   Total Issues: ${totalIssues}`);

// Export for analysis
fs.writeFileSync('validation_metrics.json', JSON.stringify(reports, null, 2));
```

## Best Practices for Script Quality

### 1. Structure Organization

```javascript
// ✅ Good: Organized by feature
context "user_management"
    recognizer "register [username]"
        say "Registering user [username]"
        
    recognizer "login [username]"
        say "Welcome back [username]"

context "shopping_cart" 
    recognizer "add [item] to cart"
        say "Added [item] to your cart"
```

### 2. Consistent Naming

```javascript
// ✅ Good: Consistent snake_case
recognizer "user_login [user_name]"
    remember "current_user is [user_name]" 
    say "Welcome [user_name]"

// ❌ Bad: Inconsistent naming
recognizer "userLogin [UserName]"
    remember "current user is [UserName]"
    say "Welcome [UserName]"
```

### 3. Reasonable Pattern Complexity

```javascript
// ✅ Good: Simple, focused patterns
recognizer "I like [color]"
    say "Great choice! [color] is beautiful."

recognizer "My name is [name]"
    remember "user name is [name]"
    say "Nice to meet you, [name]!"

// ❌ Bad: Overly complex pattern
recognizer "I really like [color] and [food] and my name is [name] and I live in [city]"
    say "Wow, lots of info: [color], [food], [name], [city]!"
```

### 4. User-Friendly Design

```javascript
// ✅ Good: Includes help and error handling
recognizer "help"
    say "I can help with: greetings, names, colors, or say 'about' for more info."

recognizer "what can you do"
    say "I can remember your name, discuss colors, and chat! Try saying 'hello'."

recognizer "*"  // Catch-all for unrecognized input
    say "I didn't understand that. Try saying 'help' to see what I can do."
```

The Script Validation & Linting system helps ensure your MoringaScript files are reliable, maintainable, and follow best practices. Use it regularly during development to catch issues early and improve code quality.