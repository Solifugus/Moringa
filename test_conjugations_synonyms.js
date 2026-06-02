const { Moringa } = require('./moringa.js');

console.log('=== TESTING CONJUGATIONS AND SYNONYMS ===\n');

const conjSynScript = `
Conjugate "I" And "you"
Conjugate "my" And "your"
Conjugate "I'm" To "you are"

synonyms "hello" : hi, hey, greetings
synonyms "goodbye" : bye, farewell, later
synonyms "yes" : yep, yeah, sure

recognizer "hello"
	say "Hello there! Synonym recognition working."

recognizer "goodbye"
	say "Goodbye! Synonym recognition working."

recognizer "yes"
	say "Yes response triggered!"

recognizer "I am happy"
	say "you are happy! (conjugation test)"

recognizer "my car is red"
	say "your car is red! (conjugation test)"

recognizer "I'm tired"
	say "you are tired! (contraction conjugation)"

recognizer "test synonyms"
	say "Try: hello, hi, hey, greetings"
	say "Try: goodbye, bye, farewell, later"
	say "Try: yes, yep, yeah, sure"
`;

const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'conj_syn_test');

agent.merge(conjSynScript, 'conj_syn_test');

console.log('Testing original words:');
agent.input('hello', 'conj_syn_test');
agent.input('goodbye', 'conj_syn_test');
agent.input('yes', 'conj_syn_test');

console.log('\nTesting synonyms:');
agent.input('hi', 'conj_syn_test');
agent.input('hey', 'conj_syn_test');
agent.input('greetings', 'conj_syn_test');
agent.input('bye', 'conj_syn_test');
agent.input('farewell', 'conj_syn_test');
agent.input('later', 'conj_syn_test');
agent.input('yep', 'conj_syn_test');
agent.input('yeah', 'conj_syn_test');
agent.input('sure', 'conj_syn_test');

console.log('\nTesting conjugations:');
agent.input('I am happy', 'conj_syn_test');
agent.input('my car is red', 'conj_syn_test');
agent.input('I\'m tired', 'conj_syn_test');

console.log('\nLoaded conjugations:');
const conjugations = agent.model.conj_syn_test.conjugations;
conjugations.forEach((conj, i) => {
    console.log(`${i + 1}. "${conj.from}" <-> "${conj.to}"`);
});

console.log('\nLoaded synonyms:');
const synonyms = agent.model.conj_syn_test.synonyms;
synonyms.forEach((syn, i) => {
    console.log(`${i + 1}. "${syn.word}" : [${syn.alternatives.join(', ')}]`);
});

console.log('\n✅ Conjugations and synonyms tests completed!');