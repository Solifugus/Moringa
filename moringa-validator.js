/**
 * Script Validation & Linting System for Moringa
 *
 * Provides comprehensive validation and linting capabilities including:
 * - MoringaScript syntax validation
 * - Best practice warnings and suggestions
 * - Pattern optimization recommendations
 * - Unused pattern detection
 * - Performance optimization hints
 * - Code quality analysis
 */

const fs = require('fs');
const path = require('path');

class MoringaValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
        this.metrics = {
            recognizers: 0,
            contexts: 0,
            memories: 0,
            variables: new Set(),
            unusedPatterns: [],
            complexityScore: 0
        };

        // Validation rules configuration
        this.rules = {
            syntax: true,
            bestPractices: true,
            performance: true,
            unused: true,
            complexity: true,
            accessibility: true
        };

        // Performance thresholds
        this.thresholds = {
            maxRecognizersPerContext: 50,
            maxVariablesPerPattern: 5,
            maxPatternLength: 100,
            maxMemoryEntries: 1000,
            maxNestingDepth: 10
        };
    }

    // Main validation method
    validate(script, options = {}) {
        const {
            filePath = 'script.pgm',
            rules = {},
            thresholds = {}
        } = options;

        // Merge configuration
        this.rules = { ...this.rules, ...rules };
        this.thresholds = { ...this.thresholds, ...thresholds };

        // Reset state
        this.resetValidation();

        try {
            // Parse and analyze the script
            const analysis = this.analyzeScript(script, filePath);

            // Run validation rules
            if (this.rules.syntax) this.validateSyntax(analysis);
            if (this.rules.bestPractices) this.validateBestPractices(analysis);
            if (this.rules.performance) this.validatePerformance(analysis);
            if (this.rules.unused) this.detectUnusedPatterns(analysis);
            if (this.rules.complexity) this.analyzeComplexity(analysis);
            if (this.rules.accessibility) this.validateAccessibility(analysis);

            // Generate optimization suggestions
            this.generateOptimizations(analysis);

            return this.generateReport(analysis, filePath);

        } catch (error) {
            this.addError('PARSE_ERROR', `Failed to parse script: ${error.message}`, 1);
            return this.generateReport(null, filePath);
        }
    }

    resetValidation() {
        this.errors = [];
        this.warnings = [];
        this.suggestions = [];
        this.metrics = {
            recognizers: 0,
            contexts: 0,
            memories: 0,
            variables: new Set(),
            unusedPatterns: [],
            complexityScore: 0
        };
    }

    analyzeScript(script, filePath) {
        const lines = script.split('\n');
        const analysis = {
            filePath,
            script,
            lines,
            tokens: this.tokenize(script),
            structure: {
                memories: [],
                synonyms: [],
                conjugations: [],
                contexts: [],
                recognizers: [],
                sequences: []
            },
            patterns: new Set(),
            variables: new Set(),
            actions: new Set(),
            conditions: new Set(),
            references: new Map() // Track where things are defined/used
        };

        // Parse script structure
        this.parseStructure(analysis);

        return analysis;
    }

    tokenize(script) {
        const tokens = [];
        const lines = script.split('\n');

        lines.forEach((line, lineNo) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) { // Skip comments
                const lineTokens = this.tokenizeLine(trimmed, lineNo + 1);
                tokens.push(...lineTokens);
            }
        });

        return tokens;
    }

    tokenizeLine(line, lineNumber) {
        const tokens = [];
        let i = 0;
        let currentToken = '';
        let inQuotes = false;

        while (i < line.length) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes) {
                    // End of quoted string
                    currentToken += char;
                    tokens.push({
                        value: currentToken,
                        line: lineNumber,
                        column: i - currentToken.length + 1,
                        type: this.classifyToken(currentToken)
                    });
                    currentToken = '';
                    inQuotes = false;
                } else {
                    // Start of quoted string
                    if (currentToken) {
                        tokens.push({
                            value: currentToken,
                            line: lineNumber,
                            column: i - currentToken.length + 1,
                            type: this.classifyToken(currentToken)
                        });
                        currentToken = '';
                    }
                    inQuotes = true;
                    currentToken += char;
                }
            } else if (char.match(/\s/) && !inQuotes) {
                // Whitespace outside quotes - end current token
                if (currentToken) {
                    tokens.push({
                        value: currentToken,
                        line: lineNumber,
                        column: i - currentToken.length + 1,
                        type: this.classifyToken(currentToken)
                    });
                    currentToken = '';
                }
            } else {
                // Regular character
                currentToken += char;
            }

            i++;
        }

        // Add final token if exists
        if (currentToken) {
            tokens.push({
                value: currentToken,
                line: lineNumber,
                column: i - currentToken.length + 1,
                type: this.classifyToken(currentToken)
            });
        }

        return tokens;
    }

    classifyToken(word) {
        // Classify token types for better analysis
        if (word.match(/^\[.*\]$/)) return 'VARIABLE';
        if (word.match(/^".*"$/)) return 'STRING';
        if (word.match(/^\d+$/)) return 'NUMBER';
        if (['recognizer', 'context', 'say', 'remember', 'recall', 'if', 'option', 'memories', 'synonyms', 'conjugate'].includes(word.toLowerCase())) {
            return 'KEYWORD';
        }
        return 'IDENTIFIER';
    }

    parseStructure(analysis) {
        const tokens = analysis.tokens;
        let currentContext = 'general';
        let currentRecognizer = null;
        let indentLevel = 0;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            switch (token.value.toLowerCase()) {
                case 'memories':
                    i = this.parseMemories(tokens, i, analysis);
                    break;

                case 'synonyms':
                    i = this.parseSynonyms(tokens, i, analysis);
                    break;

                case 'conjugate':
                    i = this.parseConjugations(tokens, i, analysis);
                    break;

                case 'context':
                    const result = this.parseContext(tokens, i, analysis);
                    currentContext = result.contextName;
                    i = result.newIndex;
                    break;

                case 'recognizer':
                    const recResult = this.parseRecognizer(tokens, i, analysis, currentContext);
                    currentRecognizer = recResult.recognizer;
                    i = recResult.newIndex;
                    break;

                case 'say':
                case 'remember':
                case 'recall':
                case 'enter':
                case 'exit':
                case 'do':
                    this.parseAction(tokens, i, analysis, token.value);
                    break;

                default:
                    // Check for variables in patterns
                    if (token.type === 'VARIABLE') {
                        this.extractVariables(token.value, analysis);
                    }
            }
        }

        // Calculate metrics
        this.calculateMetrics(analysis);
    }

    parseMemories(tokens, startIndex, analysis) {
        let i = startIndex + 1;
        while (i < tokens.length && tokens[i].value.startsWith('"')) {
            const memory = tokens[i].value.slice(1, -1); // Remove quotes
            analysis.structure.memories.push({
                content: memory,
                line: tokens[i].line
            });
            i++;
        }
        this.metrics.memories = analysis.structure.memories.length;
        return i - 1;
    }

    parseRecognizer(tokens, startIndex, analysis, context) {
        const patternToken = tokens[startIndex + 1];
        if (!patternToken || patternToken.type !== 'STRING') {
            this.addError('SYNTAX_ERROR', `Expected pattern string after 'recognizer'`, patternToken?.line || startIndex);
            return { recognizer: null, newIndex: startIndex };
        }

        const pattern = patternToken.value.slice(1, -1); // Remove quotes
        const recognizer = {
            pattern,
            context,
            line: tokens[startIndex].line,
            actions: [],
            options: [],
            variables: this.extractVariableNames(pattern)
        };

        // Track pattern usage
        analysis.patterns.add(pattern);
        analysis.structure.recognizers.push(recognizer);
        this.metrics.recognizers++;

        // Add variables to global set
        recognizer.variables.forEach(v => analysis.variables.add(v));

        return { recognizer, newIndex: startIndex + 1 };
    }

    parseContext(tokens, startIndex, analysis) {
        const nameToken = tokens[startIndex + 1];
        if (!nameToken || nameToken.type !== 'STRING') {
            this.addError('SYNTAX_ERROR', `Expected context name after 'context'`, nameToken?.line || startIndex);
            return { contextName: 'general', newIndex: startIndex };
        }

        const contextName = nameToken.value.slice(1, -1);
        const context = {
            name: contextName,
            line: tokens[startIndex].line,
            recognizers: []
        };

        analysis.structure.contexts.push(context);
        this.metrics.contexts++;

        return { contextName, newIndex: startIndex + 1 };
    }

    parseAction(tokens, startIndex, analysis, actionType) {
        analysis.actions.add(actionType);

        // Check for action-specific patterns
        if (actionType === 'say' && tokens[startIndex + 1]?.type === 'STRING') {
            const message = tokens[startIndex + 1].value.slice(1, -1);
            this.extractVariables(message, analysis);
        }
    }

    extractVariables(text, analysis) {
        const variablePattern = /\[([^\]]+)\]/g;
        let match;
        while ((match = variablePattern.exec(text)) !== null) {
            const varName = match[1];
            analysis.variables.add(varName);
            this.metrics.variables.add(varName);
        }
    }

    extractVariableNames(pattern) {
        const variables = [];
        const variablePattern = /\[([^\]]+)\]/g;
        let match;
        while ((match = variablePattern.exec(pattern)) !== null) {
            const fullVar = match[1];
            const varName = fullVar.includes(':') ? fullVar.split(':')[0] : fullVar;
            variables.push(varName.trim());
        }
        return variables;
    }

    calculateMetrics(analysis) {
        this.metrics.variables = new Set([...analysis.variables]);

        // Calculate complexity score
        this.metrics.complexityScore =
            this.metrics.recognizers * 1 +
            this.metrics.contexts * 2 +
            this.metrics.variables.size * 0.5 +
            analysis.actions.size * 0.5;
    }

    // Validation Rules

    validateSyntax(analysis) {
        // Check for common syntax errors
        this.checkMissingQuotes(analysis);
        this.checkBracketMatching(analysis);
        this.checkKeywordUsage(analysis);
    }

    validateBestPractices(analysis) {
        this.checkNamingConventions(analysis);
        this.checkPatternDesign(analysis);
        this.checkMemoryUsage(analysis);
        this.checkVariableConsistency(analysis);
        this.checkContextOrganization(analysis);
    }

    checkPatternDesign(analysis) {
        analysis.structure.recognizers.forEach(rec => {
            // Check for overly specific patterns
            if (rec.pattern.split(' ').length > 10) {
                this.addWarning('PATTERN_DESIGN',
                    `Pattern may be too specific: "${rec.pattern}"`, rec.line);
            }

            // Check for patterns that are too generic
            if (rec.pattern.length < 3) {
                this.addWarning('PATTERN_DESIGN',
                    `Pattern may be too generic: "${rec.pattern}"`, rec.line);
            }
        });
    }

    checkMemoryUsage(analysis) {
        if (this.metrics.memories > 1000) {
            this.addWarning('MEMORY_USAGE',
                `Large number of memories (${this.metrics.memories}) may impact performance`, 1);
        }
    }

    checkVariableConsistency(analysis) {
        // Check for consistent variable naming
        const variableNames = Array.from(this.metrics.variables);
        const inconsistentNames = variableNames.filter(name => {
            return name.includes(' ') || name.includes('-');
        });

        inconsistentNames.forEach(name => {
            this.addSuggestion('NAMING',
                `Consider consistent naming for variable: "${name}"`, 1);
        });
    }

    checkContextOrganization(analysis) {
        // Check for contexts with no recognizers
        analysis.structure.contexts.forEach(ctx => {
            const contextRecognizers = analysis.structure.recognizers.filter(r => r.context === ctx.name);
            if (contextRecognizers.length === 0) {
                this.addWarning('CONTEXT_ORGANIZATION',
                    `Context "${ctx.name}" has no recognizers`, ctx.line);
            }
        });
    }

    validatePerformance(analysis) {
        this.checkPatternComplexity(analysis);
        this.checkRecognizerCount(analysis);
        this.checkMemorySize(analysis);
        this.checkVariableCount(analysis);
    }

    checkMemorySize(analysis) {
        if (this.metrics.memories > this.thresholds.maxMemoryEntries) {
            this.addWarning('PERFORMANCE',
                `Large number of memories (${this.metrics.memories}) may impact performance`, 1);
        }
    }

    checkVariableCount(analysis) {
        if (this.metrics.variables.size > 50) {
            this.addWarning('PERFORMANCE',
                `Large number of variables (${this.metrics.variables.size}) consider organization`, 1);
        }
    }

    detectUnusedPatterns(analysis) {
        // Find patterns that are defined but never referenced
        const definedPatterns = new Set();
        const usedPatterns = new Set();

        analysis.structure.recognizers.forEach(rec => {
            definedPatterns.add(rec.pattern);
        });

        // Check for sequences that reference recognizers
        analysis.structure.sequences.forEach(seq => {
            // TODO: Analyze sequence content for pattern references
        });

        // Report unused patterns
        definedPatterns.forEach(pattern => {
            if (!usedPatterns.has(pattern)) {
                this.addWarning('UNUSED_PATTERN', `Pattern "${pattern}" is defined but never used`, 1);
                this.metrics.unusedPatterns.push(pattern);
            }
        });
    }

    analyzeComplexity(analysis) {
        if (this.metrics.complexityScore > 100) {
            this.addWarning('HIGH_COMPLEXITY',
                `Script complexity score is ${Math.round(this.metrics.complexityScore)} (consider breaking into modules)`, 1);
        }

        // Check nesting depth
        // TODO: Implement nesting depth analysis
    }

    validateAccessibility(analysis) {
        // Check for accessibility best practices
        this.checkResponseVariety(analysis);
        this.checkErrorHandling(analysis);
        this.checkUserGuidance(analysis);
    }

    // Specific validation checks

    checkMissingQuotes(analysis) {
        analysis.tokens.forEach(token => {
            if (token.type === 'STRING' && (!token.value.startsWith('"') || !token.value.endsWith('"'))) {
                this.addError('SYNTAX_ERROR', `Missing quotes around string: ${token.value}`, token.line);
            }
        });
    }

    checkBracketMatching(analysis) {
        let openBrackets = 0;
        analysis.tokens.forEach(token => {
            const brackets = token.value.match(/\[/g);
            const closeBrackets = token.value.match(/\]/g);
            openBrackets += (brackets?.length || 0) - (closeBrackets?.length || 0);

            if (openBrackets < 0) {
                this.addError('SYNTAX_ERROR', `Unmatched closing bracket in: ${token.value}`, token.line);
            }
        });

        if (openBrackets > 0) {
            this.addError('SYNTAX_ERROR', `${openBrackets} unclosed bracket(s) in script`, 1);
        }
    }

    checkKeywordUsage(analysis) {
        // Check for proper keyword usage
        const tokens = analysis.tokens;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            if (token.type === 'KEYWORD') {
                switch (token.value.toLowerCase()) {
                    case 'recognizer':
                        if (!nextToken || nextToken.type !== 'STRING') {
                            this.addError('SYNTAX_ERROR', `Expected quoted pattern after 'recognizer'`, token.line);
                        }
                        break;
                    case 'context':
                        if (!nextToken || nextToken.type !== 'STRING') {
                            this.addError('SYNTAX_ERROR', `Expected quoted name after 'context'`, token.line);
                        }
                        break;
                    case 'say':
                        if (!nextToken || nextToken.type !== 'STRING') {
                            this.addError('SYNTAX_ERROR', `Expected quoted message after 'say'`, token.line);
                        }
                        break;
                }
            }
        }
    }

    checkPatternComplexity(analysis) {
        analysis.structure.recognizers.forEach(rec => {
            if (rec.pattern.length > this.thresholds.maxPatternLength) {
                this.addWarning('PERFORMANCE',
                    `Pattern too long (${rec.pattern.length} chars): "${rec.pattern}"`, rec.line);
            }

            if (rec.variables.length > this.thresholds.maxVariablesPerPattern) {
                this.addWarning('PERFORMANCE',
                    `Too many variables (${rec.variables.length}) in pattern: "${rec.pattern}"`, rec.line);
            }
        });
    }

    checkNamingConventions(analysis) {
        analysis.structure.contexts.forEach(ctx => {
            if (ctx.name.includes(' ')) {
                this.addSuggestion('NAMING',
                    `Consider using snake_case or camelCase for context: "${ctx.name}"`, ctx.line);
            }
        });

        this.metrics.variables.forEach(varName => {
            if (varName.includes(' ')) {
                this.addSuggestion('NAMING',
                    `Consider using snake_case or camelCase for variable: "${varName}"`, 1);
            }
        });
    }

    checkRecognizerCount(analysis) {
        const contextCounts = {};
        analysis.structure.recognizers.forEach(rec => {
            contextCounts[rec.context] = (contextCounts[rec.context] || 0) + 1;
        });

        Object.entries(contextCounts).forEach(([contextName, count]) => {
            if (count > this.thresholds.maxRecognizersPerContext) {
                this.addWarning('PERFORMANCE',
                    `Too many recognizers in context "${contextName}" (${count}). Consider splitting.`, 1);
            }
        });
    }

    checkResponseVariety(analysis) {
        // Check for repeated responses
        const responses = new Map();

        // TODO: Extract response patterns from say actions
        // and check for repetitive responses
    }

    generateOptimizations(analysis) {
        // Suggest pattern optimizations
        this.suggestPatternOptimizations(analysis);
        this.suggestMemoryOptimizations(analysis);
        this.suggestStructuralOptimizations(analysis);
    }

    suggestPatternOptimizations(analysis) {
        const similarPatterns = this.findSimilarPatterns(analysis);
        if (similarPatterns.length > 0) {
            this.addSuggestion('OPTIMIZATION',
                `Found ${similarPatterns.length} similar patterns that could be consolidated`, 1);
        }
    }

    suggestMemoryOptimizations(analysis) {
        if (this.metrics.memories > 100) {
            this.addSuggestion('PERFORMANCE',
                `Consider using external storage for ${this.metrics.memories} memory entries`, 1);
        }
    }

    findSimilarPatterns(analysis) {
        // TODO: Implement pattern similarity analysis
        return [];
    }

    suggestStructuralOptimizations(analysis) {
        // Suggest structural improvements
        if (this.metrics.contexts === 0) {
            this.addSuggestion('STRUCTURE',
                'Consider using contexts to organize related recognizers', 1);
        }

        if (this.metrics.recognizers > 20 && this.metrics.contexts <= 1) {
            this.addSuggestion('STRUCTURE',
                `Consider organizing ${this.metrics.recognizers} recognizers into contexts`, 1);
        }
    }

    checkResponseVariety(analysis) {
        // Track response patterns to detect repetition
        const responses = new Set();
        // This would need full action parsing to implement properly
    }

    checkErrorHandling(analysis) {
        // Check for error handling patterns
        const hasErrorHandling = analysis.structure.recognizers.some(rec =>
            rec.pattern.includes('error') || rec.pattern.includes('problem'));

        if (!hasErrorHandling && this.metrics.recognizers > 10) {
            this.addSuggestion('ACCESSIBILITY',
                'Consider adding error handling recognizers', 1);
        }
    }

    checkUserGuidance(analysis) {
        // Check for help or guidance patterns
        const hasHelp = analysis.structure.recognizers.some(rec =>
            rec.pattern.includes('help') || rec.pattern.includes('what can'));

        if (!hasHelp && this.metrics.recognizers > 5) {
            this.addSuggestion('ACCESSIBILITY',
                'Consider adding help or guidance recognizers', 1);
        }
    }

    // Issue tracking

    addError(type, message, line) {
        this.errors.push({ type, message, line, severity: 'error' });
    }

    addWarning(type, message, line) {
        this.warnings.push({ type, message, line, severity: 'warning' });
    }

    addSuggestion(type, message, line) {
        this.suggestions.push({ type, message, line, severity: 'suggestion' });
    }

    // Report generation

    generateReport(analysis, filePath) {
        const totalIssues = this.errors.length + this.warnings.length;
        const isValid = this.errors.length === 0;

        return {
            filePath,
            isValid,
            analysis,
            metrics: this.metrics,
            issues: {
                errors: this.errors,
                warnings: this.warnings,
                suggestions: this.suggestions,
                total: totalIssues
            },
            summary: {
                recognizers: this.metrics.recognizers,
                contexts: this.metrics.contexts,
                variables: this.metrics.variables.size,
                memories: this.metrics.memories,
                complexityScore: Math.round(this.metrics.complexityScore),
                qualityScore: this.calculateQualityScore()
            }
        };
    }

    calculateQualityScore() {
        // Calculate a quality score based on issues and best practices
        let score = 100;

        // Deduct for issues
        score -= this.errors.length * 10;
        score -= this.warnings.length * 5;
        score -= this.suggestions.length * 1;

        // Bonus for good practices
        if (this.metrics.contexts > 1) score += 5; // Using contexts
        if (this.metrics.memories > 0) score += 5; // Using memory

        return Math.max(0, Math.min(100, score));
    }

    // Output formatting

    printReport(report, options = {}) {
        const { verbose = false, colors = true } = options;

        console.log(`📝 Moringa Script Validation Report`);
        console.log(`File: ${report.filePath}`);
        console.log(`${'='.repeat(50)}`);

        // Summary
        console.log(`\n📊 Summary:`);
        console.log(`  Status: ${report.isValid ? '✅ Valid' : '❌ Invalid'}`);
        console.log(`  Quality Score: ${report.summary.qualityScore}/100`);
        console.log(`  Complexity: ${report.summary.complexityScore}`);
        console.log(`  Recognizers: ${report.summary.recognizers}`);
        console.log(`  Contexts: ${report.summary.contexts}`);
        console.log(`  Variables: ${report.summary.variables}`);
        console.log(`  Memories: ${report.summary.memories}`);

        // Issues
        if (report.issues.total > 0) {
            console.log(`\n🚨 Issues Found: ${report.issues.total}`);

            if (report.issues.errors.length > 0) {
                console.log(`\n❌ Errors (${report.issues.errors.length}):`);
                report.issues.errors.forEach(error => {
                    console.log(`  Line ${error.line}: ${error.message}`);
                });
            }

            if (report.issues.warnings.length > 0) {
                console.log(`\n⚠️  Warnings (${report.issues.warnings.length}):`);
                report.issues.warnings.forEach(warning => {
                    console.log(`  Line ${warning.line}: ${warning.message}`);
                });
            }

            if (verbose && report.issues.suggestions.length > 0) {
                console.log(`\n💡 Suggestions (${report.issues.suggestions.length}):`);
                report.issues.suggestions.forEach(suggestion => {
                    console.log(`  Line ${suggestion.line}: ${suggestion.message}`);
                });
            }
        } else {
            console.log(`\n✅ No issues found!`);
        }

        if (verbose && report.metrics.unusedPatterns.length > 0) {
            console.log(`\n🗑️  Unused Patterns:`);
            report.metrics.unusedPatterns.forEach(pattern => {
                console.log(`  "${pattern}"`);
            });
        }
    }

    exportReport(report, filename) {
        fs.writeFileSync(filename, JSON.stringify(report, null, 2));
        console.log(`📄 Validation report exported to ${filename}`);
    }
}

module.exports = { MoringaValidator };