const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING CONTEXT SWITCHING ===\n');

const contextScript = `
recognizer "context command"
    say "In general context!"

recognizer "enter test"
    enter "test_context"
    say "Entered test context"

recognizer "exit test"
    exit "test_context"
    say "Exited test context"

context "test_context"
    recognizer "context command"
        say "In test context!"

recognizer "show contexts"
    say "Checking context status..."
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'context_debug');

agent.merge(contextScript, 'context_debug');

function showContextStatus() {
    console.log('\nContext status:');
    const model = agent.model.context_debug;
    model.contexts.forEach((ctx, i) => {
        console.log(`  ${ctx.name}: ${ctx.active ? 'ACTIVE' : 'inactive'} (${ctx.recognizers.length} recognizers)`);
    });
}

console.log('1. Initial state:');
showContextStatus();
agent.input('context command', 'context_debug');

console.log('\n2. Entering test context:');
agent.input('enter test', 'context_debug');
showContextStatus();

console.log('\n3. In test context:');
agent.input('context command', 'context_debug');

console.log('\n4. Exiting test context:');
agent.input('exit test', 'context_debug');
showContextStatus();

console.log('\n5. Back in general context:');
agent.input('context command', 'context_debug');