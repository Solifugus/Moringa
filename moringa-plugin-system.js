/**
 * Moringa Plugin System - Core Plugin Architecture
 * Provides extensible plugin interface for adding custom actions, pattern matchers, and integrations
 */

class MoringaPluginSystem {
    constructor() {
        this.plugins = new Map();
        this.pluginTypes = {
            ACTION: 'action',           // Custom action commands
            PATTERN: 'pattern',         // Custom pattern matchers
            MEMORY: 'memory',           // Memory store providers
            INTEGRATION: 'integration'   // External service integrations
        };
        this.hooks = {
            beforePatternMatch: [],
            afterPatternMatch: [],
            beforeAction: [],
            afterAction: [],
            beforeMemoryOperation: [],
            afterMemoryOperation: [],
            onContextChange: [],
            onError: []
        };
        this.enabled = true;
    }

    /**
     * Register a new plugin with the system
     * @param {Object} plugin - Plugin definition
     * @param {string} plugin.name - Unique plugin name
     * @param {string} plugin.version - Plugin version
     * @param {string} plugin.type - Plugin type (action, pattern, memory, integration)
     * @param {string} plugin.description - Plugin description
     * @param {Object} plugin.config - Plugin configuration schema
     * @param {Function} plugin.initialize - Plugin initialization function
     * @param {Function} plugin.destroy - Plugin cleanup function
     * @param {Object} plugin.exports - Plugin exported functions
     * @returns {boolean} Success status
     */
    registerPlugin(plugin) {
        try {
            // Validate plugin structure
            if (!this.validatePlugin(plugin)) {
                throw new Error(`Invalid plugin structure: ${plugin.name || 'Unknown'}`);
            }

            // Check for conflicts
            if (this.plugins.has(plugin.name)) {
                throw new Error(`Plugin '${plugin.name}' is already registered`);
            }

            // Initialize plugin state
            const pluginState = {
                ...plugin,
                id: this.generatePluginId(),
                registeredAt: new Date(),
                status: 'registered',
                instance: null,
                config: { ...plugin.config }
            };

            // Store plugin
            this.plugins.set(plugin.name, pluginState);

            console.log(`✅ Plugin '${plugin.name}' registered successfully`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to register plugin '${plugin.name}': ${error.message}`);
            return false;
        }
    }

    /**
     * Load and initialize a registered plugin
     * @param {string} pluginName - Plugin name to load
     * @param {Object} userConfig - User configuration overrides
     * @returns {boolean} Success status
     */
    async loadPlugin(pluginName, userConfig = {}) {
        try {
            const plugin = this.plugins.get(pluginName);
            if (!plugin) {
                throw new Error(`Plugin '${pluginName}' not found`);
            }

            if (plugin.status === 'loaded') {
                console.log(`⚠️  Plugin '${pluginName}' is already loaded`);
                return true;
            }

            // Merge user config with plugin defaults
            const finalConfig = { ...plugin.config, ...userConfig };

            // Initialize plugin
            let instance = null;
            if (plugin.initialize) {
                instance = await plugin.initialize(finalConfig, this.createPluginContext(plugin));
            }

            // Update plugin state
            plugin.status = 'loaded';
            plugin.instance = instance;
            plugin.config = finalConfig;
            plugin.loadedAt = new Date();

            // Register plugin hooks and exports
            this.registerPluginExports(plugin);

            console.log(`✅ Plugin '${pluginName}' loaded successfully`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to load plugin '${pluginName}': ${error.message}`);

            // Mark plugin as failed
            const plugin = this.plugins.get(pluginName);
            if (plugin) {
                plugin.status = 'failed';
                plugin.error = error.message;
            }
            return false;
        }
    }

    /**
     * Unload a plugin
     * @param {string} pluginName - Plugin name to unload
     * @returns {boolean} Success status
     */
    async unloadPlugin(pluginName) {
        try {
            const plugin = this.plugins.get(pluginName);
            if (!plugin) {
                throw new Error(`Plugin '${pluginName}' not found`);
            }

            if (plugin.status !== 'loaded') {
                console.log(`⚠️  Plugin '${pluginName}' is not loaded`);
                return true;
            }

            // Call plugin cleanup
            if (plugin.destroy && plugin.instance) {
                await plugin.destroy(plugin.instance);
            }

            // Unregister plugin exports
            this.unregisterPluginExports(plugin);

            // Update plugin state
            plugin.status = 'registered';
            plugin.instance = null;
            plugin.unloadedAt = new Date();

            console.log(`✅ Plugin '${pluginName}' unloaded successfully`);
            return true;

        } catch (error) {
            console.error(`❌ Failed to unload plugin '${pluginName}': ${error.message}`);
            return false;
        }
    }

    /**
     * Get information about registered plugins
     * @param {string} [filterType] - Optional plugin type filter
     * @returns {Array} Plugin information
     */
    listPlugins(filterType = null) {
        const plugins = Array.from(this.plugins.values());

        return plugins
            .filter(plugin => !filterType || plugin.type === filterType)
            .map(plugin => ({
                name: plugin.name,
                version: plugin.version,
                type: plugin.type,
                description: plugin.description,
                status: plugin.status,
                registeredAt: plugin.registeredAt,
                loadedAt: plugin.loadedAt,
                error: plugin.error
            }));
    }

    /**
     * Execute action plugins
     * @param {string} actionName - Action command name
     * @param {Array} args - Action arguments
     * @param {Object} context - Execution context
     * @returns {Promise<any>} Action result
     */
    async executeAction(actionName, args, context) {
        // Run before-action hooks
        await this.runHooks('beforeAction', { actionName, args, context });

        let result = null;
        let handled = false;

        // Find and execute action plugins
        for (const [name, plugin] of this.plugins) {
            if (plugin.status === 'loaded' &&
                plugin.type === this.pluginTypes.ACTION &&
                plugin.exports.actions &&
                plugin.exports.actions[actionName]) {

                try {
                    result = await plugin.exports.actions[actionName](args, context, plugin.instance);
                    handled = true;
                    break;
                } catch (error) {
                    console.error(`❌ Error in action plugin '${name}': ${error.message}`);
                    throw error;
                }
            }
        }

        if (!handled) {
            throw new Error(`Unknown action: ${actionName}`);
        }

        // Run after-action hooks
        await this.runHooks('afterAction', { actionName, args, context, result });

        return result;
    }

    /**
     * Execute pattern matcher plugins
     * @param {string} input - Input text to match
     * @param {Array} patterns - Available patterns
     * @param {Object} context - Match context
     * @returns {Promise<Object>} Match result
     */
    async matchPattern(input, patterns, context) {
        // Run before-pattern hooks
        await this.runHooks('beforePatternMatch', { input, patterns, context });

        let bestMatch = null;
        let bestScore = 0;

        // Try each pattern matcher plugin
        for (const [name, plugin] of this.plugins) {
            if (plugin.status === 'loaded' &&
                plugin.type === this.pluginTypes.PATTERN &&
                plugin.exports.matcher) {

                try {
                    const match = await plugin.exports.matcher(input, patterns, context, plugin.instance);
                    if (match && match.score > bestScore) {
                        bestMatch = match;
                        bestScore = match.score;
                    }
                } catch (error) {
                    console.error(`❌ Error in pattern plugin '${name}': ${error.message}`);
                }
            }
        }

        // Run after-pattern hooks
        await this.runHooks('afterPatternMatch', { input, patterns, context, match: bestMatch });

        return bestMatch;
    }

    /**
     * Register a hook function
     * @param {string} hookName - Hook name
     * @param {Function} callback - Hook callback function
     */
    addHook(hookName, callback) {
        if (this.hooks[hookName]) {
            this.hooks[hookName].push(callback);
        } else {
            throw new Error(`Unknown hook: ${hookName}`);
        }
    }

    /**
     * Remove a hook function
     * @param {string} hookName - Hook name
     * @param {Function} callback - Hook callback function to remove
     */
    removeHook(hookName, callback) {
        if (this.hooks[hookName]) {
            const index = this.hooks[hookName].indexOf(callback);
            if (index >= 0) {
                this.hooks[hookName].splice(index, 1);
            }
        }
    }

    /**
     * Run hook functions
     * @param {string} hookName - Hook name
     * @param {Object} data - Hook data
     */
    async runHooks(hookName, data) {
        if (!this.enabled || !this.hooks[hookName]) return;

        for (const callback of this.hooks[hookName]) {
            try {
                await callback(data);
            } catch (error) {
                console.error(`❌ Error in hook '${hookName}': ${error.message}`);
            }
        }
    }

    /**
     * Validate plugin structure
     * @param {Object} plugin - Plugin to validate
     * @returns {boolean} Is valid
     */
    validatePlugin(plugin) {
        const required = ['name', 'version', 'type', 'description'];

        // Check required fields
        for (const field of required) {
            if (!plugin[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }

        // Validate plugin type
        if (!Object.values(this.pluginTypes).includes(plugin.type)) {
            console.error(`Invalid plugin type: ${plugin.type}`);
            return false;
        }

        // Validate name format
        if (!/^[a-z][a-z0-9\-_]*$/i.test(plugin.name)) {
            console.error(`Invalid plugin name format: ${plugin.name}`);
            return false;
        }

        // Validate version format
        if (!/^\d+\.\d+\.\d+/.test(plugin.version)) {
            console.error(`Invalid version format: ${plugin.version}`);
            return false;
        }

        return true;
    }

    /**
     * Create plugin context for initialization
     * @param {Object} plugin - Plugin definition
     * @returns {Object} Plugin context
     */
    createPluginContext(plugin) {
        return {
            pluginSystem: this,
            addHook: this.addHook.bind(this),
            removeHook: this.removeHook.bind(this),
            log: (message) => console.log(`[${plugin.name}] ${message}`),
            error: (message) => console.error(`[${plugin.name}] ${message}`),
            config: plugin.config
        };
    }

    /**
     * Register plugin exports with the system
     * @param {Object} plugin - Plugin with exports
     */
    registerPluginExports(plugin) {
        if (!plugin.exports) return;

        // Register actions
        if (plugin.type === this.pluginTypes.ACTION && plugin.exports.actions) {
            for (const [actionName, actionFunc] of Object.entries(plugin.exports.actions)) {
                console.log(`📝 Registered action '${actionName}' from plugin '${plugin.name}'`);
            }
        }

        // Register pattern matchers
        if (plugin.type === this.pluginTypes.PATTERN && plugin.exports.matcher) {
            console.log(`🔍 Registered pattern matcher from plugin '${plugin.name}'`);
        }

        // Register memory providers
        if (plugin.type === this.pluginTypes.MEMORY && plugin.exports.provider) {
            console.log(`💾 Registered memory provider from plugin '${plugin.name}'`);
        }

        // Register integrations
        if (plugin.type === this.pluginTypes.INTEGRATION && plugin.exports.integration) {
            console.log(`🔗 Registered integration from plugin '${plugin.name}'`);
        }
    }

    /**
     * Unregister plugin exports
     * @param {Object} plugin - Plugin to unregister
     */
    unregisterPluginExports(plugin) {
        if (!plugin.exports) return;

        console.log(`📤 Unregistered exports from plugin '${plugin.name}'`);
    }

    /**
     * Generate unique plugin ID
     * @returns {string} Plugin ID
     */
    generatePluginId() {
        return `plugin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get plugin status and health information
     * @returns {Object} System status
     */
    getStatus() {
        const plugins = Array.from(this.plugins.values());

        return {
            enabled: this.enabled,
            totalPlugins: plugins.length,
            loadedPlugins: plugins.filter(p => p.status === 'loaded').length,
            failedPlugins: plugins.filter(p => p.status === 'failed').length,
            pluginsByType: {
                action: plugins.filter(p => p.type === this.pluginTypes.ACTION).length,
                pattern: plugins.filter(p => p.type === this.pluginTypes.PATTERN).length,
                memory: plugins.filter(p => p.type === this.pluginTypes.MEMORY).length,
                integration: plugins.filter(p => p.type === this.pluginTypes.INTEGRATION).length
            },
            hooks: Object.keys(this.hooks).reduce((acc, key) => {
                acc[key] = this.hooks[key].length;
                return acc;
            }, {})
        };
    }

    /**
     * Enable or disable the plugin system
     * @param {boolean} enabled - Enable status
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`🔌 Plugin system ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Export plugin system state for debugging
     * @param {string} [filename] - Optional file to export to
     * @returns {Object} System state
     */
    exportState(filename = null) {
        const state = {
            timestamp: new Date().toISOString(),
            enabled: this.enabled,
            plugins: Object.fromEntries(
                Array.from(this.plugins.entries()).map(([name, plugin]) => [
                    name,
                    {
                        name: plugin.name,
                        version: plugin.version,
                        type: plugin.type,
                        status: plugin.status,
                        registeredAt: plugin.registeredAt,
                        loadedAt: plugin.loadedAt,
                        error: plugin.error
                    }
                ])
            ),
            status: this.getStatus()
        };

        if (filename) {
            const fs = require('fs');
            fs.writeFileSync(filename, JSON.stringify(state, null, 2));
            console.log(`📄 Plugin system state exported to ${filename}`);
        }

        return state;
    }
}

module.exports = { MoringaPluginSystem };