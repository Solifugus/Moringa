/**
 * Demonstration of the Script Validation & Linting System
 * Tests various validation rules and linting capabilities
 */

const { MoringaValidator } = require('./moringa-validator.js');

console.log('🔍 Moringa Script Validation & Linting Demonstration');
console.log('='.repeat(60));

// Test cases with different types of issues

// 1. Good script (should pass validation)
const goodScript = `
Memories
    "javascript is a programming language"
    "nodejs is a runtime environment"

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

context "admin_mode"
    recognizer "system status"
        say "All systems operational!"

    recognizer "exit admin"
        exit "admin_mode"
        say "Exiting admin mode"
`;

// 2. Script with syntax errors
const syntaxErrorScript = `
Memories
    "javascript is a programming language
    nodejs is a runtime environment"

recognizer hello"
    say "Hello there!"

recognizer "my name is [name"
    remember "user name is [name]]"
    say "Nice to meet you, [name]!

recognizer "unclosed [variable"
    say "This has problems"
`;

// 3. Script with performance issues
const performanceIssueScript = `
recognizer "this is a very very very long pattern that exceeds reasonable length limits and might cause performance issues"
    say "Long pattern response"

recognizer "pattern with [var1] and [var2] and [var3] and [var4] and [var5] and [var6]"
    say "Too many variables: [var1] [var2] [var3] [var4] [var5] [var6]"

context "main"
${Array.from({ length: 60 }, (_, i) => `
    recognizer "test pattern ${i}"
        say "Response ${i}"`).join('')}
`;

// 4. Script with best practice violations
const bestPracticeIssueScript = `
recognizer "hello"
    say "Hi"

context "User Management"
    recognizer "create user [user name with spaces]"
        remember "user [user name with spaces]"
        say "Created user [user name with spaces]"

recognizer "unused pattern"
    say "This pattern is never called"

recognizer "another unused"
    say "This is also unused"
`;

// 5. Complex script for complexity analysis
const complexScript = `
Memories
${Array.from({ length: 200 }, (_, i) => `    "fact ${i} is important"`).join('\n')}

${Array.from({ length: 30 }, (_, i) => `
context "context_${i}"
${Array.from({ length: 10 }, (_, j) => `
    recognizer "pattern ${i}_${j}"
        say "Response ${i}_${j}"`).join('')}
`).join('')}
`;

async function runValidationTests() {
    const validator = new MoringaValidator();

    const testCases = [
        {
            name: 'Good Script (Should Pass)',
            script: goodScript,
            expectValid: true
        },
        {
            name: 'Syntax Errors',
            script: syntaxErrorScript,
            expectValid: false
        },
        {
            name: 'Performance Issues',
            script: performanceIssueScript,
            expectValid: true, // Valid but with warnings
            customRules: { performance: true }
        },
        {
            name: 'Best Practice Violations',
            script: bestPracticeIssueScript,
            expectValid: true, // Valid but with suggestions
            customRules: { bestPractices: true, unused: true }
        },
        {
            name: 'High Complexity Script',
            script: complexScript,
            expectValid: true, // Valid but complex
            customRules: { complexity: true, performance: true }
        }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];

        console.log(`\n${i + 1}. Testing: ${testCase.name}`);
        console.log('-'.repeat(50));

        try {
            const options = {
                filePath: `test_${i + 1}.pgm`,
                rules: testCase.customRules || {},
                thresholds: {
                    maxRecognizersPerContext: 15, // Lower for testing
                    maxVariablesPerPattern: 4,
                    maxPatternLength: 80,
                    maxMemoryEntries: 100
                }
            };

            const report = validator.validate(testCase.script, options);

            // Print summary
            console.log(`✅ Validation completed`);
            console.log(`   Status: ${report.isValid ? 'Valid' : 'Invalid'}`);
            console.log(`   Quality Score: ${report.summary.qualityScore}/100`);
            console.log(`   Complexity: ${report.summary.complexityScore}`);
            console.log(`   Issues: ${report.issues.total} (${report.issues.errors.length} errors, ${report.issues.warnings.length} warnings, ${report.issues.suggestions.length} suggestions)`);

            // Print detailed report for interesting cases
            if (report.issues.total > 0 || !report.isValid) {
                console.log(`\n📋 Detailed Report:`);
                validator.printReport(report, { verbose: true });
            }

            // Export detailed results for complex cases
            if (testCase.name.includes('Complex') || testCase.name.includes('Performance')) {
                const filename = `validation_report_${i + 1}.json`;
                validator.exportReport(report, filename);
            }

            // Verify expectations
            if (testCase.expectValid !== undefined) {
                if (report.isValid === testCase.expectValid) {
                    console.log(`✅ Expected validation result: ${testCase.expectValid}`);
                } else {
                    console.log(`❌ Expected ${testCase.expectValid} but got ${report.isValid}`);
                }
            }

        } catch (error) {
            console.error(`❌ Validation failed: ${error.message}`);
        }
    }

    // Test individual features
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing Individual Validation Features`);
    console.log(`${'='.repeat(60)}`);

    await testIndividualFeatures(validator);

    // Test configuration options
    console.log(`\n${'='.repeat(60)}`);
    console.log(`⚙️  Testing Configuration Options`);
    console.log(`${'='.repeat(60)}`);

    await testConfigurationOptions(validator);

    console.log(`\n🎉 Validation & Linting Demonstration Complete!`);
}

async function testIndividualFeatures(validator) {
    console.log(`\n1. Testing Syntax Validation`);
    const syntaxTest = validator.validate(`recognizer "test\nsay "response"`);
    console.log(`   Found ${syntaxTest.issues.errors.length} syntax errors`);

    console.log(`\n2. Testing Variable Extraction`);
    const varTest = validator.validate(`recognizer "my [name] is [age] years old"\n    say "Hello [name]"`);
    console.log(`   Found ${varTest.summary.variables} variables`);

    console.log(`\n3. Testing Memory Analysis`);
    const memoryScript = `
    Memories
        "fact 1"
        "fact 2"
        "fact 3"
    `;
    const memTest = validator.validate(memoryScript);
    console.log(`   Found ${memTest.summary.memories} memory entries`);

    console.log(`\n4. Testing Context Analysis`);
    const contextScript = `
    context "ctx1"
        recognizer "test1"
            say "response1"

    context "ctx2"
        recognizer "test2"
            say "response2"
    `;
    const ctxTest = validator.validate(contextScript);
    console.log(`   Found ${ctxTest.summary.contexts} contexts`);

    console.log(`\n5. Testing Performance Metrics`);
    const perfScript = `
    recognizer "simple"
        say "ok"

    recognizer "complex pattern with [var1] and [var2] and [var3] and many words that make it very long and potentially slow"
        say "complex response"
    `;
    const perfTest = validator.validate(perfScript);
    console.log(`   Complexity score: ${perfTest.summary.complexityScore}`);
    console.log(`   Performance warnings: ${perfTest.issues.warnings.filter(w => w.type === 'PERFORMANCE').length}`);
}

async function testConfigurationOptions(validator) {
    const testScript = `
    recognizer "test pattern"
        say "response"
    `;

    console.log(`\n1. Testing with all rules enabled`);
    const allEnabled = validator.validate(testScript, {
        rules: {
            syntax: true,
            bestPractices: true,
            performance: true,
            unused: true,
            complexity: true,
            accessibility: true
        }
    });
    console.log(`   Total issues: ${allEnabled.issues.total}`);

    console.log(`\n2. Testing with only syntax checking`);
    const syntaxOnly = validator.validate(testScript, {
        rules: {
            syntax: true,
            bestPractices: false,
            performance: false,
            unused: false,
            complexity: false,
            accessibility: false
        }
    });
    console.log(`   Total issues: ${syntaxOnly.issues.total}`);

    console.log(`\n3. Testing with custom thresholds`);
    const strictThresholds = validator.validate(testScript, {
        thresholds: {
            maxRecognizersPerContext: 1,
            maxVariablesPerPattern: 1,
            maxPatternLength: 10,
            maxMemoryEntries: 1
        }
    });
    console.log(`   Total issues with strict thresholds: ${strictThresholds.issues.total}`);

    console.log(`\n4. Testing quality scoring`);
    console.log(`   Good script quality: ${allEnabled.summary.qualityScore}/100`);

    // Test with a script that has multiple issues
    const problematicScript = `
    recognizer "this is a very very very very long pattern"
        say "response"

    recognizer "another bad pattern with [var1] [var2] [var3] [var4] [var5]"
        say "too many vars"
    `;

    const problematicResult = validator.validate(problematicScript);
    console.log(`   Problematic script quality: ${problematicResult.summary.qualityScore}/100`);
}

// Performance testing
async function performanceTest() {
    console.log(`\n⚡ Performance Testing`);
    console.log('-'.repeat(30));

    const validator = new MoringaValidator();

    // Generate a large script
    const largeScript = `
    Memories
    ${Array.from({ length: 100 }, (_, i) => `    "memory ${i}"`).join('\n')}

    ${Array.from({ length: 50 }, (_, i) => `
    recognizer "pattern ${i} with [var${i}]"
        say "response ${i} for [var${i}]"
    `).join('')}
    `;

    const startTime = Date.now();
    const result = validator.validate(largeScript, {
        filePath: 'large_test.pgm'
    });
    const duration = Date.now() - startTime;

    console.log(`✅ Validated large script (${largeScript.length} chars) in ${duration}ms`);
    console.log(`   Found: ${result.summary.recognizers} recognizers, ${result.summary.variables} variables`);
    console.log(`   Quality score: ${result.summary.qualityScore}/100`);
    console.log(`   Issues: ${result.issues.total}`);
}

// Run all tests
async function runAllTests() {
    try {
        await runValidationTests();
        await performanceTest();

        console.log(`\n✨ All validation tests completed successfully!`);

    } catch (error) {
        console.error(`❌ Test failed:`, error.message);
        console.error(error.stack);
    }
}

runAllTests().catch(console.error);