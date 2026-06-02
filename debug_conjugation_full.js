const { Moringa } = require('./moringa.js');

console.log('=== DEBUGGING FULL CONJUGATION FLOW ===\n');

const fullConjScript = `
Conjugate "I" And "you"
Conjugate "my" And "your"

recognizer "I am happy"
    say "you are happy!"

recognizer "my car"
    say "your car!"
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'full_conj_debug');

try {
    agent.merge(fullConjScript, 'full_conj_debug');
    console.log('✅ Script loaded');

    console.log('\nConjugations loaded:');
    const model = agent.model.full_conj_debug;
    model.conjugations.forEach((conj, i) => {
        console.log(`${i + 1}. "${conj.from}" <-> "${conj.to}"`);
    });

    console.log('\nRecognizers loaded:');
    model.contexts.forEach((ctx, i) => {
        console.log(`Context "${ctx.name}" (${ctx.active ? 'active' : 'inactive'}):`);
        ctx.recognizers.forEach((rec, j) => {
            console.log(`  ${j + 1}. Pattern: ${JSON.stringify(rec.pattern)}`);
        });
    });

    console.log('\nTesting conjugation responses:');
    console.log('Input: "I am happy"');
    agent.input('I am happy', 'full_conj_debug');

    console.log('\nInput: "my car"');
    agent.input('my car', 'full_conj_debug');

} catch (error) {
    console.log('❌ Error:', error.message);
}