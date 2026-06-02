/**
 * Moringa Enhanced v3.0 - Advanced Language Features
 * Comprehensive conversational AI with advanced pattern matching, variable system, and conditional logic
 */

const { Moringa } = require('./moringa.js');
const { MoringaPluginSystem } = require('./moringa-plugin-system.js');
const { MoringaPatternEngine } = require('./moringa-pattern-engine.js');
const { MoringaVariableSystem } = require('./moringa-variable-system.js');

class MoringaEnhancedV3 extends Moringa {
    constructor(callback, name = 'myself', script = '') {
        super(callback, name, script);

        // Initialize advanced systems
        this.pluginSystem = new MoringaPluginSystem();
        this.patternEngine = new MoringaPatternEngine();
        this.variableSystem = new MoringaVariableSystem();

        this.pluginsEnabled = true;
        this.advancedFeaturesEnabled = true;

        // Enhanced configuration
        this.config = {
            patternMatching: {
                enablePriority: true,
                enableMultiMatch: false,
                fuzzyThreshold: 0.7,
                cacheSize: 1000
            },
            variables: {
                enableTypeValidation: true,
                enableTransformations: true,
                enableScoping: true,
                defaultScope: 'local'
            },
            conditionals: {
                enableAdvancedOperators: true,
                enableNesting: true,
                maxNestingDepth: 5
            }
        };

        // Bind plugin context methods
        this.pluginContext = {
            setMemory: this.setMemory.bind(this),
            log: this.log.bind(this),
            agent: this,
            variableSystem: this.variableSystem,
            patternEngine: this.patternEngine
        };

        // Load pattern matcher plugins
        this.initializeAdvancedFeatures();

        console.log('🚀 Moringa Enhanced v3.0 initialized with advanced language features');
    }

    /**
     * Initialize advanced features
     */
    async initializeAdvancedFeatures() {
        try {
            // Load pattern matcher plugins
            await this.patternEngine.loadPatternPlugins();

            // Setup custom variable validators and transformers
            this.setupCustomVariableTypes();

            console.log('✅ Advanced features initialized successfully');
        } catch (error) {
            console.error('❌ Advanced features initialization failed:', error.message);
        }
    }

    /**
     * Enhanced input processing with advanced pattern matching
     */
    input(message, name = this.name, callback = this.callback) {
        // Set current context for variable scoping
        this.currentContext = name || 'default';
        this.currentSession = this.currentSession || this.generateSessionId();

        // Run beforeInput hooks
        if (this.pluginsEnabled) {
            this.pluginSystem.runHooks('beforeInput', {
                message,
                name,
                inputCount: this.inputCount + 1,
                context: this.currentContext
            });
        }

        let result;

        if (this.advancedFeaturesEnabled) {
            result = this.processInputAdvanced(message, name, callback);
        } else {
            result = super.input(message, name, callback);
        }

        // Run afterInput hooks
        if (this.pluginsEnabled) {
            this.pluginSystem.runHooks('afterInput', {
                message,
                name,
                result,
                inputCount: this.inputCount,
                context: this.currentContext
            });
        }

        return result;
    }

    /**
     * Advanced input processing with enhanced pattern matching
     */
    async processInputAdvanced(message, name, callback) {
        this.inputCount++;

        // Increment energy
        if (this.fading) {
            this.energy += 1;
            if (this.energy > 10) this.energy = 10;
        }

        // Get model for the speaker
        const model = this.model[name];
        if (!model) {
            console.error(`No model found for speaker: ${name}`);
            return;
        }

        // Prepare context for pattern matching
        const patternContext = {
            currentContext: this.currentContext,
            speaker: name,
            inputCount: this.inputCount,
            energy: this.energy,
            multiMatch: this.config.patternMatching.enableMultiMatch,
            threshold: this.config.patternMatching.fuzzyThreshold
        };

        // Enhanced pattern matching
        let matchResult = null;
        if (this.config.patternMatching.enablePriority) {
            matchResult = await this.patternEngine.matchPatterns(message, model.recognizers, patternContext);
        } else {
            // Fall back to original matching
            matchResult = this.matchRecognizer(message, model.recognizers, model);
        }

        if (matchResult) {
            // Enhanced variable handling
            if (matchResult.variables) {
                await this.processAdvancedVariables(matchResult.variables, model);
            }

            // Execute actions with enhanced conditional logic
            if (matchResult.pattern.recognizer.actions) {
                await this.performAdvancedActions(matchResult.pattern.recognizer.actions, model, matchResult);
            }

            // Update pattern usage statistics
            this.patternEngine.recordPatternHit(matchResult.pattern);

        } else {
            // No pattern matched - log for analysis
            this.log(`No pattern matched for input: "${message}"`, 'pattern_matching');
        }

        return matchResult;
    }

    /**
     * Process variables with advanced type validation and scoping
     */
    async processAdvancedVariables(variables, model) {
        for (const [name, value] of Object.entries(variables)) {
            // Determine variable configuration
            const varConfig = this.getVariableConfig(name, model);

            // Set variable with advanced features
            const result = this.variableSystem.setVariable(name, value, {
                scope: varConfig.scope || this.config.variables.defaultScope,
                type: varConfig.type,
                transform: varConfig.transform,
                validate: this.config.variables.enableTypeValidation,
                constraints: varConfig.constraints,
                context: this.currentContext,
                timeToLive: varConfig.ttl
            });

            if (!result.success) {
                this.log(`Variable setting failed for '${name}': ${result.error}`, 'variables');
            } else {
                this.log(`Variable '${name}' set with value '${result.value}' in scope '${result.scope}'`, 'variables');
            }
        }
    }

    /**
     * Get variable configuration from model or defaults
     */
    getVariableConfig(name, model) {
        // Check if model has variable configuration
        if (model.variableConfig && model.variableConfig[name]) {
            return model.variableConfig[name];
        }

        // Check for common patterns and apply defaults
        const config = {};

        if (name.includes('email')) {
            config.type = 'email';
            config.scope = 'session';
        } else if (name.includes('name')) {
            config.type = 'string';
            config.transform = 'capitalize';
            config.scope = 'session';
        } else if (name.includes('age')) {
            config.type = 'integer';
            config.constraints = { min: 0, max: 150 };
        } else if (name.includes('phone')) {
            config.type = 'phone';
            config.scope = 'session';
        } else if (name.includes('url')) {
            config.type = 'url';
        } else if (name.includes('date')) {
            config.type = 'date';
            config.transform = 'format_date';
        }

        return config;
    }

    /**
     * Perform actions with advanced conditional logic
     */
    async performAdvancedActions(actions, model, matchResult) {
        for (const action of actions) {
            // Enhanced conditional evaluation
            if (action.condition) {
                const conditionMet = await this.evaluateAdvancedCondition(action.condition, model, matchResult);
                if (!conditionMet) {
                    this.log(`Action skipped due to condition: ${action.condition}`, 'actions');
                    continue;
                }
            }

            // Execute action with enhanced variable substitution
            await this.executeAdvancedAction(action, model, matchResult);
        }
    }

    /**
     * Evaluate advanced conditional expressions
     */
    async evaluateAdvancedCondition(condition, model, matchResult) {
        if (!this.config.conditionals.enableAdvancedOperators) {
            return this.evaluateSimpleCondition(condition, model);
        }

        try {
            // Parse and evaluate complex conditions
            return await this.parseAndEvaluateCondition(condition, model, matchResult);
        } catch (error) {
            this.log(`Condition evaluation error: ${error.message}`, 'conditionals');
            return false;
        }
    }

    /**
     * Parse and evaluate complex conditional expressions
     */
    async parseAndEvaluateCondition(condition, model, matchResult, depth = 0) {
        if (depth > this.config.conditionals.maxNestingDepth) {
            throw new Error('Maximum condition nesting depth exceeded');
        }

        // Handle logical operators
        if (condition.includes(' AND ') || condition.includes(' && ')) {
            const parts = this.splitCondition(condition, ['AND', '&&']);
            for (const part of parts) {
                if (!(await this.parseAndEvaluateCondition(part.trim(), model, matchResult, depth + 1))) {
                    return false;
                }
            }
            return true;
        }

        if (condition.includes(' OR ') || condition.includes(' || ')) {
            const parts = this.splitCondition(condition, ['OR', '||']);
            for (const part of parts) {
                if (await this.parseAndEvaluateCondition(part.trim(), model, matchResult, depth + 1)) {
                    return true;
                }
            }
            return false;
        }

        // Handle NOT operator
        if (condition.trim().startsWith('NOT ') || condition.trim().startsWith('!')) {
            const innerCondition = condition.replace(/^(NOT\s+|!)/, '').trim();
            return !(await this.parseAndEvaluateCondition(innerCondition, model, matchResult, depth + 1));
        }

        // Handle parentheses
        const parenMatch = condition.match(/\(([^)]+)\)/);
        if (parenMatch) {
            const innerResult = await this.parseAndEvaluateCondition(parenMatch[1], model, matchResult, depth + 1);
            const newCondition = condition.replace(parenMatch[0], innerResult.toString());
            return await this.parseAndEvaluateCondition(newCondition, model, matchResult, depth + 1);
        }

        // Handle comparison operators
        const operators = ['>=', '<=', '==', '!=', '>', '<', '='];
        for (const op of operators) {
            if (condition.includes(op)) {
                return this.evaluateComparison(condition, op, model, matchResult);
            }
        }

        // Handle variable existence checks
        if (condition.startsWith('exists ')) {
            const varName = condition.substring(7).trim();
            const result = this.variableSystem.getVariable(varName, {
                context: this.currentContext
            });
            return result.found;
        }

        if (condition.startsWith('type ')) {
            const [, varName, expectedType] = condition.split(' ');
            const result = this.variableSystem.getVariable(varName, {
                context: this.currentContext
            });
            return result.found && result.type === expectedType;
        }

        // Handle simple boolean conditions
        return this.evaluateSimpleCondition(condition, model);
    }

    /**
     * Split condition by logical operators while respecting precedence
     */
    splitCondition(condition, operators) {
        const parts = [];
        let current = '';
        let parenDepth = 0;

        const tokens = condition.split(/(\s+(?:AND|OR|&&|\|\|)\s+)/);

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (operators.some(op => token.includes(op)) && parenDepth === 0) {
                if (current.trim()) {
                    parts.push(current.trim());
                    current = '';
                }
            } else {
                parenDepth += (token.match(/\(/g) || []).length;
                parenDepth -= (token.match(/\)/g) || []).length;
                current += token;
            }
        }

        if (current.trim()) {
            parts.push(current.trim());
        }

        return parts.filter(part => part.trim());
    }

    /**
     * Evaluate comparison operations
     */
    evaluateComparison(condition, operator, model, matchResult) {
        const parts = condition.split(operator).map(part => part.trim());
        if (parts.length !== 2) return false;

        const leftValue = this.resolveValue(parts[0], model, matchResult);
        const rightValue = this.resolveValue(parts[1], model, matchResult);

        switch (operator) {
            case '>=': return leftValue >= rightValue;
            case '<=': return leftValue <= rightValue;
            case '>': return leftValue > rightValue;
            case '<': return leftValue < rightValue;
            case '==':
            case '=': return leftValue == rightValue;
            case '!=': return leftValue != rightValue;
            default: return false;
        }
    }

    /**
     * Resolve value from variable name, literal, or expression
     */
    resolveValue(expression, model, matchResult) {
        expression = expression.trim();

        // Remove quotes for string literals
        if ((expression.startsWith('"') && expression.endsWith('"')) ||
            (expression.startsWith("'") && expression.endsWith("'"))) {
            return expression.slice(1, -1);
        }

        // Try to parse as number
        const num = parseFloat(expression);
        if (!isNaN(num)) {
            return num;
        }

        // Try to resolve as variable
        const varResult = this.variableSystem.getVariable(expression, {
            context: this.currentContext
        });
        if (varResult.found) {
            return varResult.value;
        }

        // Try to resolve from match result variables
        if (matchResult.variables && matchResult.variables[expression]) {
            return matchResult.variables[expression];
        }

        // Return as string literal
        return expression;
    }

    /**
     * Execute action with enhanced capabilities
     */
    async executeAdvancedAction(action, model, matchResult) {
        // Enhanced variable substitution
        const processedAction = await this.performAdvancedVariableSubstitution(action, model, matchResult);

        // Try plugin actions first
        if (this.pluginsEnabled && processedAction.command) {
            const handled = await this.tryPluginAction(processedAction, model, matchResult);
            if (handled) return;
        }

        // Fall back to original action execution
        super.performActions([processedAction], model);
    }

    /**
     * Advanced variable substitution with transformations
     */
    async performAdvancedVariableSubstitution(action, model, matchResult) {
        let processedAction = { ...action };

        // Process action parameters
        for (const [key, value] of Object.entries(processedAction)) {
            if (typeof value === 'string') {
                processedAction[key] = await this.substituteVariablesAdvanced(value, model, matchResult);
            }
        }

        return processedAction;
    }

    /**
     * Advanced variable substitution with transformation support
     */
    async substituteVariablesAdvanced(text, model, matchResult) {
        // Enhanced variable pattern: [varName|transform1,transform2]
        const enhancedPattern = /\[([^|\]]+)(?:\|([^]]+))?\]/g;

        return text.replace(enhancedPattern, (match, varName, transforms) => {
            // Get variable value
            let value = null;

            // Try match result variables first
            if (matchResult.variables && matchResult.variables[varName]) {
                value = matchResult.variables[varName];
            } else {
                // Try variable system
                const result = this.variableSystem.getVariable(varName, {
                    context: this.currentContext
                });
                if (result.found) {
                    value = result.value;
                }
            }

            // Apply transformations if specified
            if (value !== null && transforms && this.config.variables.enableTransformations) {
                const transformList = transforms.split(',').map(t => t.trim());
                try {
                    for (const transform of transformList) {
                        value = this.variableSystem.applyTransformation(value, transform, varName);
                    }
                } catch (error) {
                    this.log(`Transformation error for variable '${varName}': ${error.message}`, 'variables');
                }
            }

            return value !== null ? value : `(${varName})`;
        });
    }

    /**
     * Try to execute action via plugins
     */
    async tryPluginAction(action, model, matchResult) {
        const actionName = action.command.toLowerCase();

        for (const [name, plugin] of this.pluginSystem.plugins) {
            if (plugin.status === 'loaded' &&
                plugin.type === 'action' &&
                plugin.exports.actions &&
                plugin.exports.actions[actionName]) {

                try {
                    const context = {
                        ...this.pluginContext,
                        model,
                        matchResult,
                        currentContext: this.currentContext
                    };

                    await plugin.exports.actions[actionName](
                        action.params ? [action.params] : [],
                        context,
                        plugin.instance
                    );

                    return true;
                } catch (error) {
                    this.log(`Plugin action error: ${error.message}`, 'actions');
                    return false;
                }
            }
        }

        return false;
    }

    /**
     * Setup custom variable types for common use cases
     */
    setupCustomVariableTypes() {
        // Credit card type
        this.variableSystem.registerTypeValidator('credit_card', (value) => {
            const cleaned = value.replace(/\D/g, '');
            return /^\d{13,19}$/.test(cleaned);
        });

        // Social security number
        this.variableSystem.registerTypeValidator('ssn', (value) => {
            return /^\d{3}-?\d{2}-?\d{4}$/.test(value);
        });

        // ZIP code
        this.variableSystem.registerTypeValidator('zipcode', (value) => {
            return /^\d{5}(-\d{4})?$/.test(value);
        });

        // Currency amount
        this.variableSystem.registerTypeValidator('currency', (value) => {
            return /^\$?\d+(\.\d{2})?$/.test(value);
        });

        // Custom transformers
        this.variableSystem.registerTransformer('format_phone', (value) => {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length === 10) {
                return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
            }
            return value;
        });

        this.variableSystem.registerTransformer('format_currency', (value) => {
            const num = parseFloat(value.toString().replace(/[^\d.]/g, ''));
            return `$${num.toFixed(2)}`;
        });
    }

    /**
     * Plugin management (inherited and enhanced)
     */
    registerPlugin(plugin) {
        return this.pluginSystem.registerPlugin(plugin);
    }

    async loadPlugin(pluginName, config = {}) {
        return await this.pluginSystem.loadPlugin(pluginName, config);
    }

    async unloadPlugin(pluginName) {
        return await this.pluginSystem.unloadPlugin(pluginName);
    }

    /**
     * Pattern engine management
     */
    getPatternStatistics() {
        return this.patternEngine.getStatistics();
    }

    clearPatternCache() {
        this.patternEngine.clearCache();
    }

    /**
     * Variable system management
     */
    getVariableStatistics() {
        return this.variableSystem.getStatistics();
    }

    listVariables(scope = null, context = null) {
        return this.variableSystem.listVariables(scope, context || this.currentContext);
    }

    clearVariables(scope, context = null) {
        this.variableSystem.clearScope(scope, context || this.currentContext);
    }

    /**
     * Configuration management
     */
    setConfig(section, options) {
        if (this.config[section]) {
            this.config[section] = { ...this.config[section], ...options };
        } else {
            this.config[section] = options;
        }
    }

    getConfig(section = null) {
        return section ? this.config[section] : this.config;
    }

    /**
     * Advanced features control
     */
    setAdvancedFeaturesEnabled(enabled) {
        this.advancedFeaturesEnabled = enabled;
        return `Advanced features ${enabled ? 'enabled' : 'disabled'}`;
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Export comprehensive debug information
     */
    exportAdvancedDebugInfo(filename = null) {
        const debugInfo = {
            timestamp: new Date().toISOString(),
            version: '3.0',
            session: this.currentSession,
            context: this.currentContext,
            inputCount: this.inputCount,
            energy: this.energy,
            config: this.config,
            patternStatistics: this.patternEngine.getStatistics(),
            variableStatistics: this.variableSystem.getStatistics(),
            pluginStatus: this.pluginSystem.getStatus(),
            variables: this.variableSystem.exportVariables(),
            model: this.model,
            logEntries: this.logEntries
        };

        if (filename) {
            const fs = require('fs');
            fs.writeFileSync(filename, JSON.stringify(debugInfo, null, 2));
            console.log(`🔍 Advanced debug info exported to ${filename}`);
        }

        return debugInfo;
    }
}

module.exports = { MoringaEnhancedV3 };