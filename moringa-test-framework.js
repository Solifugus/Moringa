/**
 * Built-in Testing Framework for Moringa Conversational AI
 *
 * Provides comprehensive testing capabilities including:
 * - Testing DSL for conversation flows
 * - Test runner with clear output and reporting
 * - Test coverage analysis
 * - Performance benchmarking
 * - Automated test discovery and execution
 */

const { Moringa } = require('./moringa.js');
const { MoringaDebugger } = require('./moringa-debug.js');
const fs = require('fs');
const path = require('path');

class MoringaTestFramework {
    constructor() {
        this.tests = [];
        this.suites = [];
        this.coverage = {
            recognizers: new Set(),
            contexts: new Set(),
            actions: new Set(),
            conditions: new Set()
        };
        this.performance = {
            totalTests: 0,
            totalDuration: 0,
            slowTests: []
        };
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
    }

    // DSL for creating test suites
    describe(name, callback) {
        const suite = new TestSuite(name);
        this.suites.push(suite);

        // Set current suite context
        this.currentSuite = suite;
        callback();
        this.currentSuite = null;

        return suite;
    }

    // DSL for creating individual tests
    it(description, testFunction) {
        const test = new Test(description, testFunction);
        if (this.currentSuite) {
            this.currentSuite.addTest(test);
        } else {
            this.tests.push(test);
        }
        return test;
    }

    // Create a test context with Moringa agent
    createTestContext(script, modelName = 'test') {
        const responses = [];
        const agent = new Moringa((message) => {
            responses.push(message);
        }, modelName);

        // Enable debugging for coverage tracking
        const debug = new MoringaDebugger(agent);
        debug.setDebugLevel('off'); // Silent during tests

        try {
            agent.merge(script, modelName);
        } catch (error) {
            throw new Error(`Failed to load script: ${error.message}`);
        }

        return {
            agent,
            debug,
            responses,

            // DSL methods for test assertions
            input(message) {
                responses.length = 0; // Clear previous responses
                const startTime = Date.now();
                agent.input(message, modelName);
                const duration = Date.now() - startTime;

                return {
                    responses: [...responses],
                    duration,

                    // Assertion methods
                    shouldRespond(expectedResponse) {
                        if (responses.length === 0) {
                            throw new Error(`Expected response "${expectedResponse}" but got no response`);
                        }
                        if (responses[0] !== expectedResponse) {
                            throw new Error(`Expected "${expectedResponse}" but got "${responses[0]}"`);
                        }
                        return this;
                    },

                    shouldNotRespond() {
                        if (responses.length > 0) {
                            throw new Error(`Expected no response but got "${responses[0]}"`);
                        }
                        return this;
                    },

                    shouldContain(text) {
                        if (responses.length === 0) {
                            throw new Error(`Expected response containing "${text}" but got no response`);
                        }
                        if (!responses[0].includes(text)) {
                            throw new Error(`Expected response to contain "${text}" but got "${responses[0]}"`);
                        }
                        return this;
                    },

                    shouldHaveVariable(name, value = null) {
                        const model = agent.model[modelName];
                        const variables = model.awareness?.variable || {};

                        if (!variables[name]) {
                            throw new Error(`Expected variable "${name}" to be set`);
                        }

                        if (value !== null) {
                            const actualValue = variables[name][0]?.value;
                            if (actualValue !== value) {
                                throw new Error(`Expected variable "${name}" to be "${value}" but got "${actualValue}"`);
                            }
                        }
                        return this;
                    },

                    shouldHaveMemory(pattern) {
                        const model = agent.model[modelName];
                        const hasMemory = model.memories.some(m => m.memory === pattern);

                        if (!hasMemory) {
                            throw new Error(`Expected memory "${pattern}" to exist`);
                        }
                        return this;
                    },

                    shouldBeInContext(contextName) {
                        const model = agent.model[modelName];
                        const context = model.contexts.find(c => c.name === contextName);

                        if (!context || !context.active) {
                            throw new Error(`Expected to be in context "${contextName}"`);
                        }
                        return this;
                    },

                    shouldRespondWithin(maxDuration) {
                        if (duration > maxDuration) {
                            throw new Error(`Response took ${duration}ms, expected under ${maxDuration}ms`);
                        }
                        return this;
                    }
                };
            },

            // Memory manipulation for testing
            setMemory(pattern) {
                const model = agent.model[modelName];
                model.memories.push({
                    memory: pattern,
                    timeStamp: new Date(),
                    context: 'general'
                });
                return this;
            },

            // Context manipulation for testing
            activateContext(contextName) {
                const model = agent.model[modelName];
                const context = model.contexts.find(c => c.name === contextName);
                if (context) {
                    context.active = true;
                }
                return this;
            },

            deactivateContext(contextName) {
                const model = agent.model[modelName];
                const context = model.contexts.find(c => c.name === contextName);
                if (context) {
                    context.active = false;
                }
                return this;
            }
        };
    }

    // Run all tests
    async runTests(options = {}) {
        const {
            pattern = '**/*.test.js',
            timeout = 5000,
            verbose = false,
            coverage = true,
            performance = true
        } = options;

        console.log('🧪 Moringa Test Framework');
        console.log('=' .repeat(50));

        // Reset results
        this.resetResults();

        const startTime = Date.now();

        // Run test suites
        for (const suite of this.suites) {
            await this.runSuite(suite, { timeout, verbose, coverage });
        }

        // Run standalone tests
        for (const test of this.tests) {
            await this.runTest(test, null, { timeout, verbose, coverage });
        }

        const totalDuration = Date.now() - startTime;

        // Generate reports
        this.generateTestReport(totalDuration, verbose);

        if (coverage) {
            this.generateCoverageReport();
        }

        if (performance) {
            this.generatePerformanceReport();
        }

        return this.results;
    }

    async runSuite(suite, options) {
        console.log(`\n📦 ${suite.name}`);

        for (const test of suite.tests) {
            await this.runTest(test, suite, options);
        }
    }

    async runTest(test, suite, options) {
        const { timeout, verbose, coverage } = options;
        const suiteName = suite ? `${suite.name} > ` : '';

        try {
            const startTime = Date.now();

            // Create timeout promise
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error(`Test timeout after ${timeout}ms`)), timeout);
            });

            // Run test with timeout
            await Promise.race([
                test.run(),
                timeoutPromise
            ]);

            const duration = Date.now() - startTime;

            // Track performance
            this.performance.totalTests++;
            this.performance.totalDuration += duration;

            if (duration > 100) { // Flag slow tests
                this.performance.slowTests.push({
                    name: `${suiteName}${test.description}`,
                    duration
                });
            }

            console.log(`  ✅ ${test.description} (${duration}ms)`);
            this.results.passed++;

        } catch (error) {
            console.log(`  ❌ ${test.description}`);
            if (verbose) {
                console.log(`     ${error.message}`);
            }

            this.results.failed++;
            this.results.errors.push({
                test: `${suiteName}${test.description}`,
                error: error.message,
                stack: error.stack
            });
        }
    }

    resetResults() {
        this.results = {
            passed: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };
        this.performance = {
            totalTests: 0,
            totalDuration: 0,
            slowTests: []
        };
        this.coverage = {
            recognizers: new Set(),
            contexts: new Set(),
            actions: new Set(),
            conditions: new Set()
        };
    }

    generateTestReport(totalDuration, verbose) {
        console.log('\n📊 Test Results');
        console.log('=' .repeat(50));

        const total = this.results.passed + this.results.failed + this.results.skipped;
        const successRate = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;

        console.log(`Tests:       ${total}`);
        console.log(`Passed:      ${this.results.passed}`);
        console.log(`Failed:      ${this.results.failed}`);
        console.log(`Skipped:     ${this.results.skipped}`);
        console.log(`Success:     ${successRate}%`);
        console.log(`Duration:    ${totalDuration}ms`);

        if (this.results.failed > 0 && verbose) {
            console.log('\n❌ Failed Tests:');
            this.results.errors.forEach(error => {
                console.log(`  • ${error.test}: ${error.error}`);
            });
        }
    }

    generateCoverageReport() {
        console.log('\n📈 Coverage Report');
        console.log('=' .repeat(50));

        console.log(`Recognizers tested: ${this.coverage.recognizers.size}`);
        console.log(`Contexts tested:    ${this.coverage.contexts.size}`);
        console.log(`Actions tested:     ${this.coverage.actions.size}`);
        console.log(`Conditions tested:  ${this.coverage.conditions.size}`);

        // TODO: Calculate actual coverage percentages based on script analysis
    }

    generatePerformanceReport() {
        if (this.performance.totalTests === 0) return;

        console.log('\n⚡ Performance Report');
        console.log('=' .repeat(50));

        const avgDuration = Math.round(this.performance.totalDuration / this.performance.totalTests);
        console.log(`Average test time: ${avgDuration}ms`);

        if (this.performance.slowTests.length > 0) {
            console.log('\n🐌 Slow Tests (>100ms):');
            this.performance.slowTests
                .sort((a, b) => b.duration - a.duration)
                .slice(0, 5)
                .forEach(test => {
                    console.log(`  • ${test.name}: ${test.duration}ms`);
                });
        }
    }

    // Export test results
    exportResults(filename) {
        const results = {
            timestamp: new Date().toISOString(),
            summary: this.results,
            performance: this.performance,
            coverage: {
                recognizers: Array.from(this.coverage.recognizers),
                contexts: Array.from(this.coverage.contexts),
                actions: Array.from(this.coverage.actions),
                conditions: Array.from(this.coverage.conditions)
            },
            errors: this.results.errors
        };

        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`\n📄 Results exported to ${filename}`);
    }

    // Utility: Load tests from files
    loadTestsFromDirectory(directory) {
        // Implementation would scan directory for .test.js files
        // and dynamically load them
        console.log(`Loading tests from ${directory}...`);
        // TODO: Implement file discovery and loading
    }
}

class TestSuite {
    constructor(name) {
        this.name = name;
        this.tests = [];
    }

    addTest(test) {
        this.tests.push(test);
    }
}

class Test {
    constructor(description, testFunction) {
        this.description = description;
        this.testFunction = testFunction;
    }

    async run() {
        await this.testFunction();
    }
}

module.exports = {
    MoringaTestFramework,
    TestSuite,
    Test
};