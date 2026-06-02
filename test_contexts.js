const { Moringa } = require('./moringa.js');

console.log('=== TESTING CONTEXT SWITCHING ===\n');

const contextScript = `
context "work"
	recognizer "work task"
		say "Working on tasks in work context!"

	recognizer "leave work"
		exit "work"
		say "Leaving work context"

context "fun"
	recognizer "fun activity"
		say "Having fun in fun context!"

	recognizer "leave fun"
		exit "fun"
		say "Leaving fun context"

-- Global recognizers
recognizer "work task"
	say "No work context - general work task"

recognizer "fun activity"
	say "No fun context - general fun activity"

recognizer "enter work"
	enter "work"
	say "Entering work context"

recognizer "enter fun"
	enter "fun"
	say "Entering fun context"

recognizer "show contexts"
	say "Checking contexts..."
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'context_test');

agent.merge(contextScript, 'context_test');

function showActiveContexts() {
    console.log('--- Active Contexts ---');
    const contexts = agent.model.context_test.contexts;
    contexts.forEach((ctx, i) => {
        if (ctx.active) {
            console.log(`✅ ${ctx.name} (active)`);
        } else {
            console.log(`⭕ ${ctx.name} (inactive)`);
        }
    });
    console.log('');
}

console.log('Initial context state:');
showActiveContexts();

console.log('Testing global recognizers:');
agent.input('work task', 'context_test');
agent.input('fun activity', 'context_test');

console.log('\nEntering work context:');
agent.input('enter work', 'context_test');
showActiveContexts();

console.log('Testing work context recognizers:');
agent.input('work task', 'context_test');
agent.input('fun activity', 'context_test');

console.log('\nLeaving work and entering fun:');
agent.input('leave work', 'context_test');
agent.input('enter fun', 'context_test');
showActiveContexts();

console.log('Testing fun context recognizers:');
agent.input('work task', 'context_test');
agent.input('fun activity', 'context_test');

console.log('\nLeaving fun context:');
agent.input('leave fun', 'context_test');
showActiveContexts();

console.log('Testing global again:');
agent.input('work task', 'context_test');
agent.input('fun activity', 'context_test');

console.log('\n✅ Context switching tests completed!');