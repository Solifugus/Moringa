/**
 * Moringa State Machine System
 * Advanced conversation flow management with state transitions and guards
 */

class MoringaStateMachine {
    constructor() {
        this.states = new Map();
        this.currentState = null;
        this.stateHistory = [];
        this.transitions = new Map();
        this.guards = new Map();
        this.stateData = new Map();
        this.listeners = new Map();

        this.statistics = {
            stateChanges: 0,
            transitionAttempts: 0,
            guardFailures: 0,
            totalTransitions: 0
        };
    }

    /**
     * Define a conversation state
     * @param {string} name - State name
     * @param {Object} definition - State definition
     */
    defineState(name, definition) {
        const state = {
            name: name,
            description: definition.description || '',
            onEnter: definition.onEnter || null,
            onExit: definition.onExit || null,
            onInput: definition.onInput || null,
            recognizers: definition.recognizers || [],
            timeout: definition.timeout || null,
            timeoutAction: definition.timeoutAction || null,
            allowedTransitions: definition.allowedTransitions || [],
            metadata: definition.metadata || {}
        };

        this.states.set(name, state);

        // Initialize state data storage
        this.stateData.set(name, new Map());

        console.log(`📍 State '${name}' defined`);
        return state;
    }

    /**
     * Define a transition between states
     * @param {string} fromState - Source state
     * @param {string} toState - Target state
     * @param {Object} options - Transition options
     */
    defineTransition(fromState, toState, options = {}) {
        const transition = {
            from: fromState,
            to: toState,
            trigger: options.trigger || null,
            guard: options.guard || null,
            action: options.action || null,
            priority: options.priority || 0,
            description: options.description || '',
            metadata: options.metadata || {}
        };

        const transitionKey = `${fromState}->${toState}`;

        if (!this.transitions.has(fromState)) {
            this.transitions.set(fromState, []);
        }

        this.transitions.get(fromState).push(transition);

        // Sort transitions by priority (higher first)
        this.transitions.get(fromState).sort((a, b) => b.priority - a.priority);

        console.log(`🔀 Transition '${transitionKey}' defined`);
        return transition;
    }

    /**
     * Define a guard condition
     * @param {string} name - Guard name
     * @param {Function} condition - Guard function
     */
    defineGuard(name, condition) {
        this.guards.set(name, condition);
        console.log(`🛡️ Guard '${name}' defined`);
    }

    /**
     * Start the state machine
     * @param {string} initialState - Initial state name
     * @param {Object} context - Initial context
     */
    async start(initialState, context = {}) {
        if (!this.states.has(initialState)) {
            throw new Error(`Initial state '${initialState}' not found`);
        }

        console.log(`🚀 Starting state machine in state '${initialState}'`);

        await this.enterState(initialState, context, null);
        return this.currentState;
    }

    /**
     * Process input through the current state
     * @param {string} input - User input
     * @param {Object} context - Input context
     */
    async processInput(input, context = {}) {
        if (!this.currentState) {
            throw new Error('State machine not started');
        }

        const state = this.states.get(this.currentState);

        console.log(`🔄 Processing input '${input}' in state '${this.currentState}'`);

        // Call state's onInput handler if it exists
        if (state.onInput) {
            try {
                const result = await state.onInput(input, context, this);
                if (result && result.transition) {
                    return await this.transition(result.transition, context);
                }
            } catch (error) {
                console.error(`State '${this.currentState}' onInput error: ${error.message}`);
            }
        }

        // Check for triggered transitions
        const availableTransitions = this.transitions.get(this.currentState) || [];

        for (const transition of availableTransitions) {
            if (this.shouldTriggerTransition(transition, input, context)) {
                this.statistics.transitionAttempts++;

                if (await this.canTransition(transition, context)) {
                    return await this.executeTransition(transition, context);
                } else {
                    this.statistics.guardFailures++;
                    console.log(`🚫 Transition to '${transition.to}' blocked by guard`);
                }
            }
        }

        return {
            state: this.currentState,
            input: input,
            transitioned: false
        };
    }

    /**
     * Force a transition to a specific state
     * @param {string} targetState - Target state name
     * @param {Object} context - Transition context
     */
    async transition(targetState, context = {}) {
        if (!this.states.has(targetState)) {
            throw new Error(`Target state '${targetState}' not found`);
        }

        console.log(`🔄 Forced transition from '${this.currentState}' to '${targetState}'`);

        const transition = {
            from: this.currentState,
            to: targetState,
            forced: true
        };

        return await this.executeTransition(transition, context);
    }

    /**
     * Check if a transition should be triggered
     */
    shouldTriggerTransition(transition, input, context) {
        if (!transition.trigger) {
            return false; // No trigger defined
        }

        if (typeof transition.trigger === 'string') {
            // Simple string match
            return input.toLowerCase().includes(transition.trigger.toLowerCase());
        }

        if (transition.trigger instanceof RegExp) {
            // Regex match
            return transition.trigger.test(input);
        }

        if (typeof transition.trigger === 'function') {
            // Function evaluation
            try {
                return transition.trigger(input, context, this);
            } catch (error) {
                console.error(`Transition trigger error: ${error.message}`);
                return false;
            }
        }

        return false;
    }

    /**
     * Check if transition is allowed (guard conditions)
     */
    async canTransition(transition, context) {
        // Check state's allowed transitions
        const state = this.states.get(transition.from);
        if (state.allowedTransitions.length > 0 &&
            !state.allowedTransitions.includes(transition.to)) {
            return false;
        }

        // Check guard condition
        if (!transition.guard) {
            return true; // No guard = always allowed
        }

        let guardResult = false;

        if (typeof transition.guard === 'string') {
            // Named guard
            const guardFunction = this.guards.get(transition.guard);
            if (guardFunction) {
                guardResult = await guardFunction(context, this);
            }
        } else if (typeof transition.guard === 'function') {
            // Inline guard function
            guardResult = await transition.guard(context, this);
        }

        return guardResult;
    }

    /**
     * Execute a transition
     */
    async executeTransition(transition, context) {
        const fromState = this.currentState;
        const toState = transition.to;

        console.log(`🔀 Executing transition: ${fromState} -> ${toState}`);

        // Exit current state
        await this.exitState(fromState, context, transition);

        // Execute transition action if defined
        if (transition.action) {
            try {
                if (typeof transition.action === 'function') {
                    await transition.action(context, this);
                } else if (typeof transition.action === 'string') {
                    await this.executeAction(transition.action, context);
                }
            } catch (error) {
                console.error(`Transition action error: ${error.message}`);
            }
        }

        // Enter new state
        await this.enterState(toState, context, transition);

        this.statistics.totalTransitions++;

        return {
            from: fromState,
            to: toState,
            transitioned: true,
            context: context
        };
    }

    /**
     * Enter a state
     */
    async enterState(stateName, context, transition) {
        const state = this.states.get(stateName);

        // Update current state
        const previousState = this.currentState;
        this.currentState = stateName;

        // Add to history
        this.stateHistory.push({
            state: stateName,
            enteredAt: Date.now(),
            fromState: previousState,
            transition: transition
        });

        this.statistics.stateChanges++;

        console.log(`📍 Entered state '${stateName}'`);

        // Call onEnter handler
        if (state.onEnter) {
            try {
                await state.onEnter(context, this, transition);
            } catch (error) {
                console.error(`State '${stateName}' onEnter error: ${error.message}`);
            }
        }

        // Set up timeout if defined
        if (state.timeout) {
            setTimeout(async () => {
                if (this.currentState === stateName) { // Still in this state
                    console.log(`⏰ State '${stateName}' timed out after ${state.timeout}ms`);

                    if (state.timeoutAction) {
                        if (typeof state.timeoutAction === 'string') {
                            // Transition to another state
                            await this.transition(state.timeoutAction, context);
                        } else if (typeof state.timeoutAction === 'function') {
                            // Execute timeout function
                            await state.timeoutAction(context, this);
                        }
                    }
                }
            }, state.timeout);
        }

        // Notify listeners
        this.notifyListeners('stateEntered', {
            state: stateName,
            previousState,
            context,
            transition
        });
    }

    /**
     * Exit a state
     */
    async exitState(stateName, context, transition) {
        const state = this.states.get(stateName);

        console.log(`📤 Exiting state '${stateName}'`);

        // Call onExit handler
        if (state.onExit) {
            try {
                await state.onExit(context, this, transition);
            } catch (error) {
                console.error(`State '${stateName}' onExit error: ${error.message}`);
            }
        }

        // Notify listeners
        this.notifyListeners('stateExited', {
            state: stateName,
            context,
            transition
        });
    }

    /**
     * Execute a named action
     */
    async executeAction(actionName, context) {
        console.log(`⚡ Executing action: ${actionName}`);
        // This can be extended to handle different action types
    }

    /**
     * Get or set data for the current state
     */
    getStateData(key = null) {
        if (!this.currentState) return null;

        const stateDataMap = this.stateData.get(this.currentState);
        return key ? stateDataMap.get(key) : Object.fromEntries(stateDataMap);
    }

    setStateData(key, value) {
        if (!this.currentState) return;

        const stateDataMap = this.stateData.get(this.currentState);
        stateDataMap.set(key, value);
    }

    /**
     * Get current state information
     */
    getCurrentState() {
        if (!this.currentState) return null;

        return {
            name: this.currentState,
            state: this.states.get(this.currentState),
            data: this.getStateData(),
            history: this.stateHistory.slice(-5), // Last 5 states
            availableTransitions: this.getAvailableTransitions()
        };
    }

    /**
     * Get available transitions from current state
     */
    getAvailableTransitions() {
        if (!this.currentState) return [];

        const transitions = this.transitions.get(this.currentState) || [];
        return transitions.map(t => ({
            to: t.to,
            trigger: t.trigger,
            description: t.description,
            priority: t.priority
        }));
    }

    /**
     * Register event listeners
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Notify event listeners
     */
    notifyListeners(event, data) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Event listener error: ${error.message}`);
            }
        });
    }

    /**
     * Reset state machine
     */
    reset() {
        this.currentState = null;
        this.stateHistory = [];
        this.stateData.forEach(dataMap => dataMap.clear());

        console.log('🔄 State machine reset');
    }

    /**
     * Get state machine statistics
     */
    getStatistics() {
        return {
            ...this.statistics,
            currentState: this.currentState,
            totalStates: this.states.size,
            totalTransitions: this.transitions.size,
            historyLength: this.stateHistory.length,
            uptime: this.stateHistory.length > 0 ? Date.now() - this.stateHistory[0].enteredAt : 0
        };
    }

    /**
     * Export state machine configuration
     */
    export() {
        const exported = {
            states: {},
            transitions: {},
            guards: {},
            statistics: this.getStatistics(),
            currentState: this.currentState,
            history: this.stateHistory
        };

        // Export states
        for (const [name, state] of this.states) {
            exported.states[name] = {
                ...state,
                onEnter: state.onEnter ? '[Function]' : null,
                onExit: state.onExit ? '[Function]' : null,
                onInput: state.onInput ? '[Function]' : null,
                timeoutAction: state.timeoutAction ? '[Function]' : null
            };
        }

        // Export transitions
        for (const [fromState, transitions] of this.transitions) {
            exported.transitions[fromState] = transitions.map(t => ({
                ...t,
                trigger: typeof t.trigger === 'function' ? '[Function]' : t.trigger,
                guard: typeof t.guard === 'function' ? '[Function]' : t.guard,
                action: typeof t.action === 'function' ? '[Function]' : t.action
            }));
        }

        // Export guards
        for (const [name] of this.guards) {
            exported.guards[name] = '[Function]';
        }

        return exported;
    }

    /**
     * Create a visual representation of the state machine
     */
    visualize() {
        console.log('\n🗺️  State Machine Visualization:');
        console.log(''.padEnd(50, '='));

        for (const [stateName, state] of this.states) {
            const isCurrent = stateName === this.currentState;
            const marker = isCurrent ? '👉' : '  ';

            console.log(`${marker} [${stateName}] ${state.description}`);

            const transitions = this.transitions.get(stateName) || [];
            transitions.forEach(t => {
                const trigger = typeof t.trigger === 'string' ? `"${t.trigger}"` :
                               typeof t.trigger === 'function' ? '[Function]' :
                               t.trigger ? '[RegExp]' : '[Always]';

                console.log(`      → ${t.to} (${trigger})`);
            });

            if (transitions.length === 0) {
                console.log('      (no transitions)');
            }
            console.log('');
        }
    }
}

module.exports = { MoringaStateMachine };