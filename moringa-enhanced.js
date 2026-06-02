/**
 * Moringa Enhanced - Plugin-Enabled Conversational AI Engine
 * Extends the original Moringa with comprehensive plugin architecture
 */

const { Moringa } = require('./moringa.js');
const { MoringaPluginSystem } = require('./moringa-plugin-system.js');

class MoringaEnhanced extends Moringa {
    constructor(callback, name = 'myself', script = '') {
        super(callback, name, script);

        // Initialize plugin system
        this.pluginSystem = new MoringaPluginSystem();
        this.pluginsEnabled = true;

        // Bind plugin context methods
        this.pluginContext = {
            setMemory: this.setMemory.bind(this),
            log: this.log.bind(this),
            agent: this
        };

        console.log('🚀 Moringa Enhanced initialized with plugin support');
    }

    /**
     * Register a plugin with the system
     * @param {Object} plugin - Plugin definition
     * @returns {boolean} Success status
     */
    registerPlugin(plugin) {
        return this.pluginSystem.registerPlugin(plugin);
    }

    /**
     * Load a registered plugin
     * @param {string} pluginName - Plugin name
     * @param {Object} config - Plugin configuration
     * @returns {boolean} Success status
     */
    async loadPlugin(pluginName, config = {}) {
        return await this.pluginSystem.loadPlugin(pluginName, config);
    }

    /**
     * Unload a plugin
     * @param {string} pluginName - Plugin name
     * @returns {boolean} Success status
     */
    async unloadPlugin(pluginName) {
        return await this.pluginSystem.unloadPlugin(pluginName);
    }

    /**
     * List all registered plugins
     * @param {string} [type] - Optional plugin type filter
     * @returns {Array} Plugin information
     */
    listPlugins(type = null) {
        return this.pluginSystem.listPlugins(type);
    }

    /**
     * Get plugin system status
     * @returns {Object} Status information
     */
    getPluginStatus() {
        return this.pluginSystem.getStatus();
    }

    /**
     * Enhanced performActions with plugin support
     * Extends the original performActions to check for plugin actions first
     */
    performActions(actions, model) {
        // Set up model awareness context for plugins
        if (!model.awareness) {
            model.awareness = {
                energy: this.energy,
                recognizer: false,
                contextName: 'general',
                contextPriority: 0,
                variable: {},
                options: [],
                validOptions: []
            };
        }

        // Create plugin context
        const pluginContext = {
            ...this.pluginContext,
            model: model,
            awareness: model.awareness,
            setVariable: (name, value) => this.setVariableInModel(name, value, model),
            getVariable: (name) => this.getVariableFromModel(name, model)
        };

        // Process each action
        var response = '';
        var toSchedule = { when: null, performed: false, actions: [] };

        for (var a = 0; a < actions.length; a += 1) {
            var action = actions[a];

            // Add to log
            if (action.command.substr(0, 6) !== 'conjug') {
                this.log('Performing action "' + action.command + '": ' + JSON.stringify(action.param), 'actions');
            }

            // Handle scheduling logic
            if (action.command.toLowerCase() !== 'do' && toSchedule.when !== null) {
                toSchedule.actions.push(action);
                continue;
            }

            // Try plugin actions first (if plugins enabled)
            let actionHandled = false;
            if (this.pluginsEnabled) {
                try {
                    // Check if we have a synchronous handler for this action
                    const actionName = action.command.toLowerCase();
                    let pluginFound = false;

                    // Look for action plugins
                    for (const [name, plugin] of this.pluginSystem.plugins) {
                        if (plugin.status === 'loaded' &&
                            plugin.type === this.pluginSystem.pluginTypes.ACTION &&
                            plugin.exports.actions &&
                            plugin.exports.actions[actionName]) {

                            pluginFound = true;

                            // Execute plugin action (handle async in background if needed)
                            this.executePluginActionAsync(actionName, action.param ? [action.param] : [], pluginContext, plugin);
                            actionHandled = true;
                            this.log(`✅ Plugin action '${action.command}' dispatched successfully`, 'actions');
                            break;
                        }
                    }

                    if (!pluginFound) {
                        // Action not found in plugins, fall through to original system
                        actionHandled = false;
                    }

                } catch (error) {
                    console.error(`❌ Plugin action '${action.command}' failed: ${error.message}`);
                    actionHandled = false; // Fall through on error
                }
            }

            // If plugin didn't handle it, use original system
            if (!actionHandled) {
                // Call original performActions for this single action
                const singleAction = [action];
                super.performActions(singleAction, model);
            }
        }

        // Handle scheduling
        if (toSchedule.when !== null) {
            model.schedules.push(toSchedule);
            this.checkSchedule();
        }

        return response;
    }

    /**
     * Execute plugin action asynchronously without blocking main flow
     */
    async executePluginActionAsync(actionName, args, context, plugin) {
        try {
            const result = await plugin.exports.actions[actionName](args, context, plugin.instance);
            this.log(`🔌 Plugin action '${actionName}' completed: ${result}`, 'actions');
        } catch (error) {
            console.error(`❌ Plugin action '${actionName}' error: ${error.message}`);
        }
    }

    /**
     * Enhanced matchRecognizer with plugin support
     * Tries plugin pattern matchers before falling back to original system
     */
    matchRecognizer(message, matchers, model) {
        // For now, let's focus on the core plugin functionality and use original pattern matching
        // Plugin pattern matchers can be implemented as a future enhancement
        // that doesn't interfere with the synchronous nature of the core system

        // Fall back to original pattern matching
        return super.matchRecognizer(message, matchers, model);
    }

    /**
     * Enhanced input processing with plugin hooks
     */
    input(message, name = this.name, callback = this.callback) {
        // Run beforeInput hooks
        if (this.pluginsEnabled) {
            this.pluginSystem.runHooks('beforeInput', {
                message,
                name,
                inputCount: this.inputCount + 1
            });
        }

        // Call original input processing
        const result = super.input(message, name, callback);

        // Run afterInput hooks
        if (this.pluginsEnabled) {
            this.pluginSystem.runHooks('afterInput', {
                message,
                name,
                result,
                inputCount: this.inputCount
            });
        }

        return result;
    }

    /**
     * Helper method to set variables in a specific model
     */
    setVariableInModel(name, value, model) {
        if (!model.awareness) return;

        if (!model.awareness.variable[name]) {
            model.awareness.variable[name] = [];
        }

        model.awareness.variable[name].push({
            value: value,
            timeStamp: new Date()
        });
    }

    /**
     * Helper method to get variables from a specific model
     */
    getVariableFromModel(name, model) {
        if (!model.awareness || !model.awareness.variable[name]) {
            return null;
        }

        const variables = model.awareness.variable[name];
        return variables.length > 0 ? variables[variables.length - 1].value : null;
    }

    /**
     * Enhanced memory operations with plugin support
     */
    setMemory(context, memory, model = null, timeStamp = null) {
        if (!model) model = this.model[this.name];
        if (!timeStamp) timeStamp = new Date();

        // Run beforeMemoryOperation hooks
        if (this.pluginsEnabled) {
            this.pluginSystem.runHooks('beforeMemoryOperation', {
                operation: 'set',
                context,
                memory,
                model
            });
        }

        // Call original setMemory
        const result = super.setMemory ? super.setMemory(context, memory, model, timeStamp) : this.actionRemember({ statement: memory }, model);

        // Run afterMemoryOperation hooks
        if (this.pluginsEnabled) {
            this.pluginSystem.runHooks('afterMemoryOperation', {
                operation: 'set',
                context,
                memory,
                model,
                result
            });
        }

        return result;
    }

    /**
     * Plugin management commands
     */
    async loadPluginByName(name, config = {}) {
        try {
            const success = await this.loadPlugin(name, config);
            return success ? `Plugin '${name}' loaded successfully` : `Failed to load plugin '${name}'`;
        } catch (error) {
            return `Error loading plugin '${name}': ${error.message}`;
        }
    }

    async unloadPluginByName(name) {
        try {
            const success = await this.unloadPlugin(name);
            return success ? `Plugin '${name}' unloaded successfully` : `Failed to unload plugin '${name}'`;
        } catch (error) {
            return `Error unloading plugin '${name}': ${error.message}`;
        }
    }

    getPluginList() {
        const plugins = this.listPlugins();
        if (plugins.length === 0) {
            return 'No plugins registered';
        }

        let list = `Registered plugins (${plugins.length}):\n`;
        for (const plugin of plugins) {
            list += `  • ${plugin.name} v${plugin.version} (${plugin.type}) - ${plugin.status}\n`;
        }

        return list;
    }

    /**
     * Enable or disable plugin system
     */
    setPluginsEnabled(enabled) {
        this.pluginsEnabled = enabled;
        this.pluginSystem.setEnabled(enabled);

        const status = enabled ? 'enabled' : 'disabled';
        this.log(`Plugin system ${status}`, 'system');

        return `Plugin system ${status}`;
    }

    /**
     * Export comprehensive debug information including plugin state
     */
    exportDebugInfo(filename = null) {
        const debugInfo = {
            timestamp: new Date().toISOString(),
            inputCount: this.inputCount,
            energy: this.energy,
            fading: this.fading,
            model: this.model,
            logEntries: this.logEntries,
            traces: this.traces,
            pluginSystem: {
                enabled: this.pluginsEnabled,
                status: this.getPluginStatus(),
                plugins: this.listPlugins()
            }
        };

        if (filename) {
            const fs = require('fs');
            fs.writeFileSync(filename, JSON.stringify(debugInfo, null, 2));
            console.log(`🔍 Debug info exported to ${filename}`);
        }

        return debugInfo;
    }

    /**
     * Create a test context for development
     */
    createTestContext() {
        return {
            agent: this,
            pluginSystem: this.pluginSystem,
            loadPlugin: this.loadPlugin.bind(this),
            unloadPlugin: this.unloadPlugin.bind(this),
            testInput: (message) => {
                console.log(`🧪 Testing input: "${message}"`);
                return this.input(message);
            },
            testAction: async (actionName, params = []) => {
                console.log(`🧪 Testing action: ${actionName}(${params.join(', ')})`);
                try {
                    const result = await this.pluginSystem.executeAction(actionName, params, this.pluginContext);
                    console.log(`✅ Action result:`, result);
                    return result;
                } catch (error) {
                    console.error(`❌ Action failed:`, error.message);
                    throw error;
                }
            }
        };
    }
}

module.exports = { MoringaEnhanced };