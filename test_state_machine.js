/**
 * State Machine Demonstration for Moringa
 * Shows advanced conversation flow management with states and transitions
 */

const { MoringaStateMachine } = require('./moringa-state-machine.js');

console.log('🗂️  MORINGA STATE MACHINE DEMONSTRATION');
console.log('='.repeat(60));

async function runStateMachineDemo() {

    // Create a state machine for a customer service chatbot
    const stateMachine = new MoringaStateMachine();

    console.log('🏗️  Building customer service conversation flow...\n');

    // === DEFINE STATES ===

    // Initial greeting state
    stateMachine.defineState('greeting', {
        description: 'Welcome and initial greeting',
        onEnter: async (context, sm) => {
            console.log('🤖 Welcome! How can I help you today?');
            console.log('   (Say: help, billing, support, or account)');
        },
        timeout: 30000, // 30 seconds
        timeoutAction: 'timeout'
    });

    // Main menu state
    stateMachine.defineState('main_menu', {
        description: 'Main service menu',
        onEnter: async (context, sm) => {
            console.log('🤖 Please choose from:');
            console.log('   • Billing (say "billing")');
            console.log('   • Technical Support (say "support")');
            console.log('   • Account Management (say "account")');
            console.log('   • Speak to Human (say "human")');
        }
    });

    // Billing department state
    stateMachine.defineState('billing', {
        description: 'Billing department',
        onEnter: async (context, sm) => {
            console.log('💳 Billing Department');
            console.log('🤖 I can help with payments, invoices, or billing questions.');
            console.log('   What billing issue can I assist with?');
            sm.setStateData('department', 'billing');
        },
        onInput: async (input, context, sm) => {
            if (input.toLowerCase().includes('payment')) {
                return { transition: 'payment_processing' };
            }
            if (input.toLowerCase().includes('invoice')) {
                return { transition: 'invoice_lookup' };
            }
        }
    });

    // Technical support state
    stateMachine.defineState('support', {
        description: 'Technical support department',
        onEnter: async (context, sm) => {
            console.log('🛠️  Technical Support Department');
            console.log('🤖 I can help troubleshoot technical issues.');
            console.log('   What technical problem are you experiencing?');
            sm.setStateData('department', 'support');
        },
        onInput: async (input, context, sm) => {
            if (input.toLowerCase().includes('internet') || input.toLowerCase().includes('connection')) {
                return { transition: 'internet_troubleshooting' };
            }
            if (input.toLowerCase().includes('password') || input.toLowerCase().includes('login')) {
                return { transition: 'password_reset' };
            }
        }
    });

    // Account management state
    stateMachine.defineState('account', {
        description: 'Account management',
        onEnter: async (context, sm) => {
            console.log('👤 Account Management');
            console.log('🤖 I can help with account settings and information.');
            console.log('   What account changes do you need?');
            sm.setStateData('department', 'account');
        }
    });

    // Payment processing state
    stateMachine.defineState('payment_processing', {
        description: 'Processing payment',
        onEnter: async (context, sm) => {
            console.log('💰 Payment Processing');
            console.log('🤖 Let me help you with your payment.');
            console.log('   Please provide your account number or say "balance" to check balance.');
        },
        onInput: async (input, context, sm) => {
            if (input.toLowerCase().includes('balance')) {
                console.log('🤖 Your current balance is $45.99. Would you like to pay now?');
                return null; // Stay in same state
            }
            if (input.match(/\d{6,}/)) { // Account number pattern
                sm.setStateData('account_number', input);
                return { transition: 'payment_confirmation' };
            }
        }
    });

    // Payment confirmation state
    stateMachine.defineState('payment_confirmation', {
        description: 'Confirming payment details',
        onEnter: async (context, sm) => {
            const accountNumber = sm.getStateData('account_number');
            console.log('✅ Payment Confirmation');
            console.log(`🤖 Account: ***${accountNumber.slice(-4)}`);
            console.log('   Say "confirm" to proceed or "cancel" to abort.');
        }
    });

    // Internet troubleshooting state
    stateMachine.defineState('internet_troubleshooting', {
        description: 'Internet connection troubleshooting',
        onEnter: async (context, sm) => {
            console.log('🌐 Internet Troubleshooting');
            console.log('🤖 Let\'s diagnose your connection issue.');
            console.log('   Have you tried restarting your router? (yes/no)');
        },
        onInput: async (input, context, sm) => {
            if (input.toLowerCase().includes('yes')) {
                console.log('🤖 Great! Is your connection working now?');
                return null;
            }
            if (input.toLowerCase().includes('no')) {
                console.log('🤖 Please unplug your router for 30 seconds, then plug it back in.');
                return { transition: 'router_restart' };
            }
        }
    });

    // Router restart state
    stateMachine.defineState('router_restart', {
        description: 'Router restart instructions',
        onEnter: async (context, sm) => {
            console.log('🔄 Router Restart Process');
            console.log('🤖 Please wait for all lights to come back on, then test your connection.');
            console.log('   Say "working" if fixed or "still broken" if not.');
        }
    });

    // Password reset state
    stateMachine.defineState('password_reset', {
        description: 'Password reset assistance',
        onEnter: async (context, sm) => {
            console.log('🔑 Password Reset');
            console.log('🤖 I can help you reset your password.');
            console.log('   Please provide your email address.');
        },
        onInput: async (input, context, sm) => {
            if (input.includes('@')) {
                sm.setStateData('email', input);
                console.log(`🤖 Password reset link sent to ${input}`);
                return { transition: 'resolution' };
            }
        }
    });

    // Human handoff state
    stateMachine.defineState('human_handoff', {
        description: 'Transferring to human agent',
        onEnter: async (context, sm) => {
            console.log('👥 Human Agent Transfer');
            console.log('🤖 Transferring you to a human agent...');
            console.log('   Estimated wait time: 3-5 minutes');
        },
        timeout: 3000, // Simulate quick transfer
        timeoutAction: 'resolution'
    });

    // Resolution state
    stateMachine.defineState('resolution', {
        description: 'Issue resolution',
        onEnter: async (context, sm) => {
            console.log('✅ Issue Resolution');
            console.log('🤖 Is there anything else I can help you with today?');
            console.log('   Say "yes" for more help or "no" to end conversation.');
        }
    });

    // Timeout state
    stateMachine.defineState('timeout', {
        description: 'Session timeout',
        onEnter: async (context, sm) => {
            console.log('⏰ Session Timeout');
            console.log('🤖 This session has timed out due to inactivity.');
            console.log('   Say "restart" to begin again or "goodbye" to exit.');
        }
    });

    // End state
    stateMachine.defineState('end', {
        description: 'Conversation ended',
        onEnter: async (context, sm) => {
            console.log('👋 Goodbye');
            console.log('🤖 Thank you for contacting us. Have a great day!');
        }
    });

    // === DEFINE TRANSITIONS ===

    console.log('🔀 Defining state transitions...\n');

    // From greeting
    stateMachine.defineTransition('greeting', 'main_menu', {
        trigger: (input) => ['help', 'menu', 'options'].some(word =>
            input.toLowerCase().includes(word)),
        priority: 10
    });

    stateMachine.defineTransition('greeting', 'billing', {
        trigger: 'billing',
        priority: 8
    });

    stateMachine.defineTransition('greeting', 'support', {
        trigger: 'support',
        priority: 8
    });

    stateMachine.defineTransition('greeting', 'account', {
        trigger: 'account',
        priority: 8
    });

    stateMachine.defineTransition('greeting', 'timeout', {
        trigger: 'timeout',
        priority: 1
    });

    // From main_menu
    stateMachine.defineTransition('main_menu', 'billing', {
        trigger: 'billing',
        priority: 10
    });

    stateMachine.defineTransition('main_menu', 'support', {
        trigger: 'support',
        priority: 10
    });

    stateMachine.defineTransition('main_menu', 'account', {
        trigger: 'account',
        priority: 10
    });

    stateMachine.defineTransition('main_menu', 'human_handoff', {
        trigger: 'human',
        priority: 9
    });

    // From billing
    stateMachine.defineTransition('billing', 'payment_processing', {
        trigger: 'payment',
        priority: 10
    });

    stateMachine.defineTransition('billing', 'main_menu', {
        trigger: 'back',
        priority: 5
    });

    // From payment_processing
    stateMachine.defineTransition('payment_processing', 'payment_confirmation', {
        trigger: (input) => /\d{6,}/.test(input),
        priority: 10
    });

    stateMachine.defineTransition('payment_processing', 'billing', {
        trigger: 'back',
        priority: 5
    });

    // From payment_confirmation
    stateMachine.defineTransition('payment_confirmation', 'resolution', {
        trigger: 'confirm',
        priority: 10,
        action: async (context, sm) => {
            console.log('💳 Payment processed successfully!');
        }
    });

    stateMachine.defineTransition('payment_confirmation', 'billing', {
        trigger: 'cancel',
        priority: 8
    });

    // From support
    stateMachine.defineTransition('support', 'internet_troubleshooting', {
        trigger: (input) => ['internet', 'connection', 'wifi'].some(word =>
            input.toLowerCase().includes(word)),
        priority: 10
    });

    stateMachine.defineTransition('support', 'password_reset', {
        trigger: (input) => ['password', 'login', 'reset'].some(word =>
            input.toLowerCase().includes(word)),
        priority: 10
    });

    stateMachine.defineTransition('support', 'main_menu', {
        trigger: 'back',
        priority: 5
    });

    // From troubleshooting states
    stateMachine.defineTransition('internet_troubleshooting', 'resolution', {
        trigger: 'working',
        priority: 10
    });

    stateMachine.defineTransition('internet_troubleshooting', 'router_restart', {
        trigger: 'no',
        priority: 8
    });

    stateMachine.defineTransition('router_restart', 'resolution', {
        trigger: 'working',
        priority: 10
    });

    stateMachine.defineTransition('router_restart', 'human_handoff', {
        trigger: (input) => ['still broken', 'not working', 'broken'].some(phrase =>
            input.toLowerCase().includes(phrase)),
        priority: 8
    });

    // Universal transitions
    ['billing', 'support', 'account', 'payment_processing', 'internet_troubleshooting', 'router_restart'].forEach(state => {
        stateMachine.defineTransition(state, 'human_handoff', {
            trigger: (input) => ['human', 'agent', 'person', 'representative'].some(word =>
                input.toLowerCase().includes(word)),
            priority: 7
        });

        stateMachine.defineTransition(state, 'end', {
            trigger: (input) => ['goodbye', 'bye', 'quit', 'exit'].some(word =>
                input.toLowerCase().includes(word)),
            priority: 6
        });
    });

    // From resolution
    stateMachine.defineTransition('resolution', 'main_menu', {
        trigger: 'yes',
        priority: 10
    });

    stateMachine.defineTransition('resolution', 'end', {
        trigger: 'no',
        priority: 10
    });

    // From timeout
    stateMachine.defineTransition('timeout', 'greeting', {
        trigger: 'restart',
        priority: 10
    });

    stateMachine.defineTransition('timeout', 'end', {
        trigger: 'goodbye',
        priority: 8
    });

    // === DEFINE GUARDS ===

    console.log('🛡️ Defining guard conditions...\n');

    stateMachine.defineGuard('business_hours', (context, sm) => {
        const hour = new Date().getHours();
        return hour >= 9 && hour < 17; // 9 AM to 5 PM
    });

    stateMachine.defineGuard('authenticated', (context, sm) => {
        return context.authenticated || false;
    });

    // === ADD EVENT LISTENERS ===

    stateMachine.on('stateEntered', (data) => {
        console.log(`📍 [EVENT] Entered state: ${data.state}`);
    });

    stateMachine.on('stateExited', (data) => {
        console.log(`📤 [EVENT] Exited state: ${data.state}`);
    });

    // === START THE STATE MACHINE ===

    console.log('🚀 Starting customer service state machine...\n');
    await stateMachine.start('greeting');

    // === SIMULATION ===

    console.log('\n🎭 CONVERSATION SIMULATION');
    console.log('-'.repeat(40));

    const testInputs = [
        { input: 'I need help', delay: 1000 },
        { input: 'billing', delay: 1500 },
        { input: 'I want to make a payment', delay: 1000 },
        { input: '123456789', delay: 1500 },
        { input: 'confirm', delay: 1000 },
        { input: 'yes', delay: 1000 },
        { input: 'support', delay: 1500 },
        { input: 'internet connection problems', delay: 1000 },
        { input: 'no', delay: 1500 },
        { input: 'still broken', delay: 2000 },
        { delay: 3500 }, // Wait for human handoff timeout
        { input: 'no', delay: 1000 }
    ];

    console.log('\n🎯 Running conversation simulation...\n');

    for (let i = 0; i < testInputs.length; i++) {
        const { input, delay } = testInputs[i];

        await new Promise(resolve => setTimeout(resolve, delay));

        if (input) {
            console.log(`\n👤 User: ${input}`);
            const result = await stateMachine.processInput(input, { step: i + 1 });

            if (result.transitioned) {
                console.log(`   ↳ Transitioned to: ${result.to}`);
            }
        } else {
            console.log('\n⏳ [Waiting...]');
        }

        // Show current state info
        const currentInfo = stateMachine.getCurrentState();
        if (currentInfo) {
            console.log(`   📍 Current state: ${currentInfo.name}`);

            // Show state data if any
            const stateData = Object.entries(currentInfo.data);
            if (stateData.length > 0) {
                console.log(`   📊 State data: ${JSON.stringify(currentInfo.data)}`);
            }
        }
    }

    // === VISUALIZATION AND STATISTICS ===

    console.log('\n' + '='.repeat(60));
    console.log('📊 STATE MACHINE STATISTICS');
    console.log('-'.repeat(30));

    const stats = stateMachine.getStatistics();
    console.log(`Total States: ${stats.totalStates}`);
    console.log(`State Changes: ${stats.stateChanges}`);
    console.log(`Total Transitions: ${stats.totalTransitions}`);
    console.log(`Transition Attempts: ${stats.transitionAttempts}`);
    console.log(`Guard Failures: ${stats.guardFailures}`);
    console.log(`Current State: ${stats.currentState}`);
    console.log(`Session Duration: ${(stats.uptime / 1000).toFixed(1)}s`);

    console.log('\n📋 STATE HISTORY (Last 5):');
    const history = stateMachine.stateHistory.slice(-5);
    history.forEach((entry, index) => {
        const fromText = entry.fromState ? ` from ${entry.fromState}` : '';
        const timeAgo = ((Date.now() - entry.enteredAt) / 1000).toFixed(1);
        console.log(`  ${index + 1}. ${entry.state}${fromText} (${timeAgo}s ago)`);
    });

    console.log('\n🗺️  STATE MACHINE VISUALIZATION:');
    stateMachine.visualize();

    console.log('\n📤 EXPORTING CONFIGURATION:');
    const config = stateMachine.export();
    console.log(`States defined: ${Object.keys(config.states).length}`);
    console.log(`Transition rules: ${Object.values(config.transitions).flat().length}`);
    console.log(`Guard functions: ${Object.keys(config.guards).length}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 STATE MACHINE DEMONSTRATION COMPLETE!');
    console.log('');
    console.log('📋 Capabilities Demonstrated:');
    console.log('  ✅ Complex conversation flow management');
    console.log('  ✅ State transitions with multiple triggers');
    console.log('  ✅ Guard conditions and constraints');
    console.log('  ✅ State-specific data storage');
    console.log('  ✅ Timeout handling and fallback states');
    console.log('  ✅ Event listeners and notifications');
    console.log('  ✅ Statistical tracking and visualization');
    console.log('  ✅ Configuration export and debugging');
    console.log('');
    console.log('🚀 Advanced conversation state management is ready for production!');
}

// Run the demonstration
runStateMachineDemo().catch(error => {
    console.error('❌ State machine demo failed:', error);
    console.error(error.stack);
});