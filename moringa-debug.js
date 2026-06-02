/**
 * Enhanced Debugging System for Moringa Conversational AI
 *
 * Provides comprehensive debugging capabilities including:
 * - Pattern matching trace with step-by-step analysis
 * - Memory operation logging with detailed context
 * - Variable substitution debugging with transformation tracking
 * - Context switching visualization
 * - Performance profiling
 */

class MoringaDebugger {
    constructor(moringa) {
        this.moringa = moringa;
        this.debugLevel = 'info'; // 'off', 'error', 'warn', 'info', 'verbose', 'trace'
        this.tracePatterns = true;
        this.traceMemory = true;
        this.traceVariables = true;
        this.traceContexts = true;
        this.tracePerformance = false;
        this.debugHistory = [];
        this.performanceMetrics = {};

        // Hook into original methods
        this.hookMethods();
    }

    setDebugLevel(level) {
        const validLevels = ['off', 'error', 'warn', 'info', 'verbose', 'trace'];
        if (validLevels.includes(level)) {
            this.debugLevel = level;
        } else {
            this.error('Invalid debug level. Valid levels:', validLevels);
        }
    }

    // Enable/disable specific trace categories
    setTraceOptions(options) {
        if (options.patterns !== undefined) this.tracePatterns = options.patterns;
        if (options.memory !== undefined) this.traceMemory = options.memory;
        if (options.variables !== undefined) this.traceVariables = options.variables;
        if (options.contexts !== undefined) this.traceContexts = options.contexts;
        if (options.performance !== undefined) this.tracePerformance = options.performance;
    }

    // Logging methods with different levels
    log(level, category, message, data = null) {
        const levels = { off: 0, error: 1, warn: 2, info: 3, verbose: 4, trace: 5 };
        const currentLevel = levels[this.debugLevel] || 0;
        const messageLevel = levels[level] || 3;

        if (messageLevel <= currentLevel && currentLevel > 0) {
            const timestamp = new Date().toISOString();
            const entry = {
                timestamp,
                level,
                category,
                message,
                data: data ? JSON.parse(JSON.stringify(data)) : null
            };

            this.debugHistory.push(entry);

            // Format output
            const prefix = `[${timestamp}] ${level.toUpperCase()} [${category}]`;
            console.log(`${prefix} ${message}`);

            if (data && this.debugLevel === 'trace') {
                console.log('  Data:', JSON.stringify(data, null, 2));
            }
        }
    }

    error(message, data) { this.log('error', 'DEBUG', message, data); }
    warn(message, data) { this.log('warn', 'DEBUG', message, data); }
    info(message, data) { this.log('info', 'DEBUG', message, data); }
    verbose(message, data) { this.log('verbose', 'DEBUG', message, data); }
    trace(message, data) { this.log('trace', 'DEBUG', message, data); }

    // Performance timing
    startTimer(operation) {
        if (this.tracePerformance) {
            this.performanceMetrics[operation] = { start: Date.now() };
        }
    }

    endTimer(operation) {
        if (this.tracePerformance && this.performanceMetrics[operation]) {
            const duration = Date.now() - this.performanceMetrics[operation].start;
            this.performanceMetrics[operation].duration = duration;
            this.verbose(`Performance: ${operation} took ${duration}ms`);
        }
    }

    // Enhanced pattern matching trace
    tracePatternMatch(input, recognizer, context, result) {
        if (!this.tracePatterns) return;

        this.info('Pattern Match Attempt', {
            input,
            pattern: recognizer.pattern,
            context: context.name,
            matched: result !== false
        });

        if (result !== false) {
            this.verbose('Pattern Match Success', {
                variables: result,
                recognizer: recognizer.pattern
            });
        } else {
            this.verbose('Pattern Match Failed', {
                pattern: recognizer.pattern,
                input
            });
        }
    }

    // Enhanced variable substitution debugging
    traceVariableSubstitution(pattern, variables, result) {
        if (!this.traceVariables) return;

        this.verbose('Variable Substitution', {
            originalPattern: pattern,
            availableVariables: Object.keys(variables),
            result
        });

        // Show each variable substitution
        for (const [name, values] of Object.entries(variables)) {
            if (pattern.includes(`[${name}]`)) {
                this.trace(`Variable [${name}] substituted with: ${this.formatVariableValues(values)}`);
            }
        }
    }

    // Memory operation logging
    traceMemoryOperation(operation, params, result) {
        if (!this.traceMemory) return;

        this.info(`Memory ${operation}`, {
            params,
            result: result ? 'Success' : 'Failed',
            details: result
        });
    }

    // Context switching visualization
    traceContextSwitch(fromContext, toContext, trigger) {
        if (!this.traceContexts) return;

        this.info('Context Switch', {
            from: fromContext,
            to: toContext,
            trigger
        });
    }

    // Enhanced recognizer segment matching with detailed tracing
    traceSegmentMatch(actuals, matchers, segmentNo, variables) {
        if (!this.tracePatterns || this.debugLevel !== 'trace') return;

        this.trace(`Segment ${segmentNo} Matching`, {
            matchers,
            actuals: actuals.slice(0, 20), // Limit to first 20 tokens
            variablesSoFar: Object.keys(variables)
        });
    }

    // Choice variable debugging
    traceChoiceVariable(name, value, allowedChoices, isValid) {
        if (!this.traceVariables) return;

        this.verbose('Choice Variable Validation', {
            variable: name,
            value,
            allowedChoices,
            isValid
        });
    }

    // Memory recall debugging
    traceMemoryRecall(pattern, memories, matches) {
        if (!this.traceMemory) return;

        this.verbose('Memory Recall', {
            searchPattern: pattern,
            totalMemories: memories.length,
            matches: matches.map(m => ({
                memory: m.memory,
                score: m.score
            }))
        });
    }

    // Conditional logic debugging
    traceCondition(condition, variables, result) {
        this.verbose('Condition Evaluation', {
            condition,
            availableVariables: Object.keys(variables),
            result: result ? 'TRUE' : 'FALSE'
        });
    }

    // Get debug summary
    getDebugSummary() {
        const summary = {
            totalEntries: this.debugHistory.length,
            entriesByLevel: {},
            entriesByCategory: {},
            performanceMetrics: this.performanceMetrics
        };

        this.debugHistory.forEach(entry => {
            summary.entriesByLevel[entry.level] = (summary.entriesByLevel[entry.level] || 0) + 1;
            summary.entriesByCategory[entry.category] = (summary.entriesByCategory[entry.category] || 0) + 1;
        });

        return summary;
    }

    // Export debug history
    exportDebugHistory(filename = null) {
        const exportData = {
            timestamp: new Date().toISOString(),
            debugLevel: this.debugLevel,
            traceOptions: {
                patterns: this.tracePatterns,
                memory: this.traceMemory,
                variables: this.traceVariables,
                contexts: this.traceContexts,
                performance: this.tracePerformance
            },
            summary: this.getDebugSummary(),
            history: this.debugHistory
        };

        if (filename) {
            require('fs').writeFileSync(filename, JSON.stringify(exportData, null, 2));
            this.info(`Debug history exported to ${filename}`);
        }

        return exportData;
    }

    // Clear debug history
    clearHistory() {
        this.debugHistory = [];
        this.performanceMetrics = {};
        this.info('Debug history cleared');
    }

    // Helper methods
    formatVariableValues(values) {
        return values.map(v => v.value).join(', ');
    }

    // Hook into original Moringa methods to add debugging
    hookMethods() {
        // Hook interpret method
        const originalInterpret = this.moringa.interpret.bind(this.moringa);
        this.moringa.interpret = (message, model, refresh = true) => {
            this.startTimer('interpret');
            this.info('Starting interpretation', { message, modelName: model.name || 'unknown' });

            const result = originalInterpret(message, model, refresh);

            this.endTimer('interpret');
            this.info('Interpretation complete', {
                matched: result.recognizer !== false,
                recognizer: result.recognizer,
                variablesCollected: Object.keys(result.variable).length,
                optionsAvailable: result.options.length
            });

            return result;
        };

        // Hook matchRecognizerSegment for detailed pattern matching
        const originalMatchSegment = this.moringa.matchRecognizerSegment.bind(this.moringa);
        this.moringa.matchRecognizerSegment = (variable, actuals, matchers, skipSegments, model) => {
            this.traceSegmentMatch(actuals, matchers, 0, variable);
            return originalMatchSegment(variable, actuals, matchers, skipSegments, model);
        };

        // Hook formatOutput for variable substitution debugging
        const originalFormatOutput = this.moringa.formatOutput.bind(this.moringa);
        this.moringa.formatOutput = (pattern, variable, conjugations, blankTo = '') => {
            this.traceVariableSubstitution(pattern, variable, null);
            const result = originalFormatOutput(pattern, variable, conjugations, blankTo);
            this.traceVariableSubstitution(pattern, variable, result);
            return result;
        };
    }
}

module.exports = { MoringaDebugger };