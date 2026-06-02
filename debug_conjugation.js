const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING CONJUGATION PARSING ===\n');

// Simple test that should work
const simpleConjScript = `
Conjugate "I" And "you"
`;

console.log('Testing simple conjugation script:');
console.log(JSON.stringify(simpleConjScript));

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'conj_debug');

try {
    agent.merge(simpleConjScript, 'conj_debug');
    console.log('✅ Simple script loaded successfully');

    console.log('\nConjugations loaded:');
    const model = agent.model.conj_debug;
    model.conjugations.forEach((conj, i) => {
        console.log(`${i + 1}. "${conj.from}" <-> "${conj.to}"`);
    });
} catch (error) {
    console.log('❌ Error loading script:', error.message);
}

// Test the actual problematic script
const problemScript = `
Conjugate "I" And "you"
Conjugate "my" And "your"
`;

console.log('\n\nTesting problematic script:');
console.log(JSON.stringify(problemScript));

const agent2 = new Moringa((message) => {
    console.log('Bot:', message);
}, 'problem_debug');

try {
    agent2.merge(problemScript, 'problem_debug');
    console.log('✅ Problem script loaded successfully');
} catch (error) {
    console.log('❌ Error loading problem script:', error.message);
}