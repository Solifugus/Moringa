#!/usr/bin/node

const { Moringa } = require('./moringa.js');

let messages = [];
const agent = new Moringa((msg) => {
    console.log('Agent says:', msg);
    messages.push(msg);
}, 'testbot');

console.log('Testing command parsing...');

// Add debug to actionSynonyms
const originalActionSynonyms = agent.actionSynonyms;
agent.actionSynonyms = function(param, model) {
    console.log('actionSynonyms called with param:', param);
    console.log('model.awareness:', model.awareness);
    return originalActionSynonyms.call(this, param, model);
};

const script = `synonyms "hello" : hi, hey, greetings\n`;
console.log('Script:', JSON.stringify(script));

console.log('\nBefore merge - synonyms count:', agent.model.testbot.synonyms.length);

const result = agent.merge(script, 'testbot');
console.log('Merge result:', result);

console.log('After merge - synonyms count:', agent.model.testbot.synonyms.length);
console.log('Synonyms:', JSON.stringify(agent.model.testbot.synonyms, null, 2));