/**
 * Moringa Enhanced Variable System
 * Advanced variable management with type validation, transformations, and scoping
 */

class MoringaVariableSystem {
    constructor() {
        this.scopes = {
            global: new Map(),      // Persistent across sessions
            session: new Map(),     // Persistent within session
            local: new Map(),       // Temporary for current context
            context: new Map()      // Context-specific variables
        };

        this.typeValidators = new Map();
        this.transformers = new Map();
        this.constraints = new Map();

        this.setupBuiltinTypes();
        this.setupBuiltinTransformers();

        this.statistics = {
            setOperations: 0,
            getOperations: 0,
            validationFailures: 0,
            transformations: 0,
            typeValidations: 0
        };
    }

    /**
     * Set a variable with type validation and scope management
     * @param {string} name - Variable name
     * @param {*} value - Variable value
     * @param {Object} options - Setting options
     */
    setVariable(name, value, options = {}) {
        const {
            scope = 'local',
            type = null,
            transform = null,
            validate = true,
            constraints = null,
            context = 'default',
            timeToLive = null
        } = options;

        this.statistics.setOperations++;

        try {
            // Apply transformations if specified
            let processedValue = value;
            if (transform) {
                processedValue = this.applyTransformation(processedValue, transform, name);
            }

            // Type validation
            if (type && validate) {
                const isValid = this.validateType(processedValue, type, name);
                if (!isValid) {
                    this.statistics.validationFailures++;
                    throw new Error(`Variable '${name}' failed type validation for type '${type}'`);
                }
                this.statistics.typeValidations++;
            }

            // Constraint validation
            if (constraints) {
                const constraintsPassed = this.validateConstraints(processedValue, constraints, name);
                if (!constraintsPassed) {
                    this.statistics.validationFailures++;
                    throw new Error(`Variable '${name}' failed constraint validation`);
                }
            }

            // Create variable entry
            const variableEntry = {
                value: processedValue,
                type: type,
                timestamp: Date.now(),
                context: context,
                originalValue: value,
                transformations: transform ? [transform] : [],
                timeToLive: timeToLive,
                expiresAt: timeToLive ? Date.now() + timeToLive : null
            };

            // Store in appropriate scope
            this.storeInScope(name, variableEntry, scope, context);

            return {
                success: true,
                name: name,
                value: processedValue,
                scope: scope,
                type: type
            };

        } catch (error) {
            return {
                success: false,
                name: name,
                error: error.message,
                value: value
            };
        }
    }

    /**
     * Get a variable with scope resolution and automatic cleanup
     * @param {string} name - Variable name
     * @param {Object} options - Retrieval options
     */
    getVariable(name, options = {}) {
        const {
            scope = null,           // null means search all scopes
            context = 'default',
            defaultValue = null,
            transform = null
        } = options;

        this.statistics.getOperations++;

        // Clean up expired variables first
        this.cleanupExpiredVariables();

        let result = null;

        if (scope) {
            // Search specific scope
            result = this.getFromScope(name, scope, context);
        } else {
            // Search scopes in priority order: local -> context -> session -> global
            const searchOrder = ['local', 'context', 'session', 'global'];

            for (const scopeName of searchOrder) {
                result = this.getFromScope(name, scopeName, context);
                if (result) break;
            }
        }

        if (!result) {
            return {
                found: false,
                name: name,
                value: defaultValue,
                scope: null
            };
        }

        // Apply transformations if specified
        let finalValue = result.value;
        if (transform) {
            try {
                finalValue = this.applyTransformation(finalValue, transform, name);
            } catch (error) {
                console.warn(`Transformation failed for variable '${name}': ${error.message}`);
            }
        }

        return {
            found: true,
            name: name,
            value: finalValue,
            originalValue: result.originalValue,
            scope: result.scope,
            type: result.type,
            timestamp: result.timestamp,
            context: result.context,
            transformations: result.transformations
        };
    }

    /**
     * Store variable in specified scope
     */
    storeInScope(name, variableEntry, scope, context) {
        if (!this.scopes[scope]) {
            throw new Error(`Invalid scope: ${scope}`);
        }

        const scopeMap = this.scopes[scope];
        const key = scope === 'context' ? `${context}:${name}` : name;

        variableEntry.scope = scope;
        scopeMap.set(key, variableEntry);
    }

    /**
     * Retrieve variable from specified scope
     */
    getFromScope(name, scope, context) {
        if (!this.scopes[scope]) return null;

        const scopeMap = this.scopes[scope];
        const key = scope === 'context' ? `${context}:${name}` : name;

        return scopeMap.get(key) || null;
    }

    /**
     * Apply type validation
     */
    validateType(value, type, name) {
        const validator = this.typeValidators.get(type);
        if (!validator) {
            console.warn(`Unknown type '${type}' for variable '${name}'`);
            return true; // Allow unknown types
        }

        return validator(value, name);
    }

    /**
     * Apply transformations
     */
    applyTransformation(value, transformation, name) {
        if (typeof transformation === 'string') {
            const transformer = this.transformers.get(transformation);
            if (!transformer) {
                throw new Error(`Unknown transformation '${transformation}' for variable '${name}'`);
            }
            this.statistics.transformations++;
            return transformer(value, name);
        }

        if (typeof transformation === 'function') {
            this.statistics.transformations++;
            return transformation(value, name);
        }

        if (Array.isArray(transformation)) {
            let result = value;
            for (const transform of transformation) {
                result = this.applyTransformation(result, transform, name);
            }
            return result;
        }

        throw new Error(`Invalid transformation type for variable '${name}'`);
    }

    /**
     * Validate constraints
     */
    validateConstraints(value, constraints, name) {
        if (typeof constraints === 'function') {
            return constraints(value, name);
        }

        if (Array.isArray(constraints)) {
            return constraints.every(constraint => this.validateConstraints(value, constraint, name));
        }

        if (typeof constraints === 'object') {
            // Handle constraint objects
            if (constraints.min !== undefined && value < constraints.min) {
                return false;
            }
            if (constraints.max !== undefined && value > constraints.max) {
                return false;
            }
            if (constraints.minLength !== undefined && value.length < constraints.minLength) {
                return false;
            }
            if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
                return false;
            }
            if (constraints.pattern && !constraints.pattern.test(value)) {
                return false;
            }
            if (constraints.values && !constraints.values.includes(value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Setup built-in type validators
     */
    setupBuiltinTypes() {
        // Number type
        this.typeValidators.set('number', (value) => {
            return typeof value === 'number' && !isNaN(value);
        });

        // Integer type
        this.typeValidators.set('integer', (value) => {
            return Number.isInteger(value);
        });

        // String type
        this.typeValidators.set('string', (value) => {
            return typeof value === 'string';
        });

        // Email type
        this.typeValidators.set('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return typeof value === 'string' && emailRegex.test(value);
        });

        // URL type
        this.typeValidators.set('url', (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        });

        // Date type
        this.typeValidators.set('date', (value) => {
            return value instanceof Date || !isNaN(Date.parse(value));
        });

        // Boolean type
        this.typeValidators.set('boolean', (value) => {
            return typeof value === 'boolean';
        });

        // Phone number type
        this.typeValidators.set('phone', (value) => {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return typeof value === 'string' && phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        });

        // Array type
        this.typeValidators.set('array', (value) => {
            return Array.isArray(value);
        });

        // Object type
        this.typeValidators.set('object', (value) => {
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        });
    }

    /**
     * Setup built-in transformers
     */
    setupBuiltinTransformers() {
        // String transformations
        this.transformers.set('lowercase', (value) => {
            return typeof value === 'string' ? value.toLowerCase() : String(value).toLowerCase();
        });

        this.transformers.set('uppercase', (value) => {
            return typeof value === 'string' ? value.toUpperCase() : String(value).toUpperCase();
        });

        this.transformers.set('trim', (value) => {
            return typeof value === 'string' ? value.trim() : String(value).trim();
        });

        this.transformers.set('capitalize', (value) => {
            const str = typeof value === 'string' ? value : String(value);
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        });

        this.transformers.set('title_case', (value) => {
            const str = typeof value === 'string' ? value : String(value);
            return str.replace(/\w\S*/g, (txt) =>
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        });

        // Number transformations
        this.transformers.set('to_number', (value) => {
            const num = parseFloat(value);
            if (isNaN(num)) {
                throw new Error(`Cannot convert '${value}' to number`);
            }
            return num;
        });

        this.transformers.set('to_integer', (value) => {
            const num = parseInt(value, 10);
            if (isNaN(num)) {
                throw new Error(`Cannot convert '${value}' to integer`);
            }
            return num;
        });

        this.transformers.set('round', (value) => {
            return Math.round(parseFloat(value));
        });

        this.transformers.set('abs', (value) => {
            return Math.abs(parseFloat(value));
        });

        // Date transformations
        this.transformers.set('to_date', (value) => {
            return new Date(value);
        });

        this.transformers.set('format_date', (value) => {
            const date = new Date(value);
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
        });

        // Array transformations
        this.transformers.set('first', (value) => {
            return Array.isArray(value) ? value[0] : value;
        });

        this.transformers.set('last', (value) => {
            return Array.isArray(value) ? value[value.length - 1] : value;
        });

        this.transformers.set('length', (value) => {
            if (Array.isArray(value) || typeof value === 'string') {
                return value.length;
            }
            return 0;
        });

        // String formatting
        this.transformers.set('quote', (value) => {
            return `"${value}"`;
        });

        this.transformers.set('escape_html', (value) => {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        });
    }

    /**
     * Clean up expired variables
     */
    cleanupExpiredVariables() {
        const now = Date.now();

        for (const [scopeName, scopeMap] of Object.entries(this.scopes)) {
            for (const [key, entry] of scopeMap.entries()) {
                if (entry.expiresAt && entry.expiresAt <= now) {
                    scopeMap.delete(key);
                }
            }
        }
    }

    /**
     * Register a custom type validator
     */
    registerTypeValidator(typeName, validator) {
        this.typeValidators.set(typeName, validator);
    }

    /**
     * Register a custom transformer
     */
    registerTransformer(name, transformer) {
        this.transformers.set(name, transformer);
    }

    /**
     * Clear variables from a specific scope
     */
    clearScope(scope, context = null) {
        if (!this.scopes[scope]) {
            throw new Error(`Invalid scope: ${scope}`);
        }

        if (scope === 'context' && context) {
            // Clear only variables from specific context
            const scopeMap = this.scopes[scope];
            const prefix = `${context}:`;
            for (const key of scopeMap.keys()) {
                if (key.startsWith(prefix)) {
                    scopeMap.delete(key);
                }
            }
        } else {
            // Clear entire scope
            this.scopes[scope].clear();
        }
    }

    /**
     * List variables in a scope
     */
    listVariables(scope = null, context = 'default') {
        const variables = [];

        const scopesToSearch = scope ? [scope] : Object.keys(this.scopes);

        for (const scopeName of scopesToSearch) {
            const scopeMap = this.scopes[scopeName];

            for (const [key, entry] of scopeMap.entries()) {
                let name = key;
                let entryContext = entry.context || 'default';

                // Handle context-scoped variables
                if (scopeName === 'context') {
                    const parts = key.split(':');
                    if (parts.length === 2) {
                        entryContext = parts[0];
                        name = parts[1];
                    }
                }

                // Filter by context if specified
                if (scope === 'context' && entryContext !== context) {
                    continue;
                }

                variables.push({
                    name: name,
                    value: entry.value,
                    type: entry.type,
                    scope: scopeName,
                    context: entryContext,
                    timestamp: entry.timestamp,
                    expiresAt: entry.expiresAt
                });
            }
        }

        return variables.sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get system statistics
     */
    getStatistics() {
        return {
            ...this.statistics,
            variableCounts: {
                global: this.scopes.global.size,
                session: this.scopes.session.size,
                local: this.scopes.local.size,
                context: this.scopes.context.size
            },
            totalVariables: Object.values(this.scopes).reduce((sum, map) => sum + map.size, 0),
            typeValidators: this.typeValidators.size,
            transformers: this.transformers.size
        };
    }

    /**
     * Export variables for backup/debugging
     */
    exportVariables() {
        const exported = {
            timestamp: Date.now(),
            scopes: {}
        };

        for (const [scopeName, scopeMap] of Object.entries(this.scopes)) {
            exported.scopes[scopeName] = Array.from(scopeMap.entries()).map(([key, entry]) => ({
                key,
                ...entry
            }));
        }

        return exported;
    }

    /**
     * Import variables from backup
     */
    importVariables(exported, options = {}) {
        const { clearExisting = false, scope = null } = options;

        if (clearExisting) {
            if (scope) {
                this.clearScope(scope);
            } else {
                for (const scopeMap of Object.values(this.scopes)) {
                    scopeMap.clear();
                }
            }
        }

        for (const [scopeName, entries] of Object.entries(exported.scopes)) {
            if (scope && scopeName !== scope) continue;

            if (this.scopes[scopeName]) {
                const scopeMap = this.scopes[scopeName];
                for (const entry of entries) {
                    const { key, ...variableEntry } = entry;
                    scopeMap.set(key, variableEntry);
                }
            }
        }
    }
}

module.exports = { MoringaVariableSystem };