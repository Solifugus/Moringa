/**
 * Core Moringa Engine Unit Tests
 *
 * Tests for basic functionality, pattern recognition, memory system,
 * variables, conjugations, and command execution.
 */

const { Moringa } = require('../moringa.js');

describe('Moringa Core Functionality', () => {
    let agent;
    let messages;

    beforeEach(() => {
        messages = [];
        agent = new Moringa((msg) => messages.push(msg), 'testbot');
    });

    describe('Basic Initialization', () => {
        test('should create agent with default parameters', () => {
            expect(agent).toBeInstanceOf(Moringa);
            expect(agent.name).toBe('testbot');
            expect(agent.model.testbot).toBeDefined();
            expect(agent.model.testbot.contexts).toBeDefined();
            expect(agent.model.testbot.memories).toBeDefined();
        });

        test('should have general context by default', () => {
            expect(agent.model.testbot.contexts.length).toBe(1);
            expect(agent.model.testbot.contexts[0].name).toBe('general');
        });
    });

    describe('Script Merging and Parsing', () => {
        test('should merge simple script without errors', () => {
            const script = `
                Memories
                    "test is working"
                    "sky is blue"

                recognizer "hello"
                    say "Hi there!"
            `;

            const result = agent.merge(script, 'testbot');
            expect(result).toBeFalsy(); // No error message returned
        });

        test('should handle memories directive', () => {
            const script = `
                Memories
                    "test memory one"
                    "test memory two"
            `;

            agent.merge(script, 'testbot');
            expect(agent.model.testbot.memories.length).toBeGreaterThan(0);

            // Check if memories were added
            const memoryTexts = agent.model.testbot.memories.map(m => m.memory);
            expect(memoryTexts).toContain("test memory one");
            expect(memoryTexts).toContain("test memory two");
        });

        test('should handle conjugations', () => {
            const script = `
                Conjugate "I" And "you"
                Conjugate "my" And "your"
            `;

            agent.merge(script, 'testbot');
            expect(agent.model.testbot.conjugations.length).toBeGreaterThan(0);
        });

        test('should handle synonyms', () => {
            const script = `
                synonyms "hello" : hi, hey, greetings
            `;

            agent.merge(script, 'testbot');
            expect(agent.model.testbot.synonyms.length).toBe(1);
            expect(agent.model.testbot.synonyms[0].keyword).toBe('hello');
            expect(agent.model.testbot.synonyms[0].members).toContain('hi');
            expect(agent.model.testbot.synonyms[0].members).toContain('hey');
        });
    });

    describe('Pattern Recognition', () => {
        beforeEach(() => {
            const script = `
                recognizer "hello"
                    say "Hi there!"

                recognizer "my name is [name]"
                    say "Nice to meet you, [name]!"

                recognizer "i like [thing]"
                    remember "user likes [thing]"
                    say "Great! I'm glad you like [thing]."
            `;
            agent.merge(script, 'testbot');
        });

        test('should recognize simple pattern', () => {
            agent.input('hello', 'testbot');
            expect(messages).toContain("Hi there!");
        });

        test('should capture variables in patterns', () => {
            agent.input('my name is Alice', 'testbot');
            expect(messages).toContain("Nice to meet you, Alice!");
        });

        test('should handle remember and recall with variables', () => {
            agent.input('i like cookies', 'testbot');
            expect(messages).toContain("Great! I'm glad you like cookies.");

            // Check if memory was created
            const memoryTexts = agent.model.testbot.memories.map(m => m.memory);
            expect(memoryTexts).toContain("user likes cookies");
        });

        test('should handle case insensitive matching', () => {
            agent.input('HELLO', 'testbot');
            expect(messages).toContain("Hi there!");
        });
    });

    describe('Memory System', () => {
        test('should store and recall memories', () => {
            const script = `
                recognizer "remember [fact]"
                    remember "[fact]"
                    say "I will remember that."

                recognizer "what do you remember"
                    recall "[memory]"
                    say "I remember: [memory]"
            `;

            agent.merge(script, 'testbot');

            // Store a memory
            messages = [];
            agent.input('remember cats are cute', 'testbot');
            expect(messages).toContain("I will remember that.");

            // Recall memory
            messages = [];
            agent.input('what do you remember', 'testbot');
            expect(messages.some(msg => msg.includes('cats are cute'))).toBe(true);
        });
    });

    describe('Options and Conditions', () => {
        beforeEach(() => {
            const script = `
                recognizer "i am [feeling]"
                    remember "[feeling] is a feeling"
                    option if "[feeling] is positive"
                        say "That's wonderful!"
                    option if "[feeling] is negative"
                        say "I'm sorry to hear that."
                    option if not "[feeling] is positive" and not "[feeling] is negative"
                        say "Is [feeling] a positive or negative feeling?"
            `;
            agent.merge(script, 'testbot');

            // Pre-populate some knowledge
            agent.merge(`
                Memories
                    "happy is positive"
                    "sad is negative"
                    "excited is positive"
            `, 'testbot');
        });

        test('should select correct option based on conditions', () => {
            messages = [];
            agent.input('i am happy', 'testbot');
            expect(messages).toContain("That's wonderful!");
        });

        test('should handle negative conditions', () => {
            messages = [];
            agent.input('i am sad', 'testbot');
            expect(messages).toContain("I'm sorry to hear that.");
        });

        test('should handle unknown feeling', () => {
            messages = [];
            agent.input('i am confused', 'testbot');
            expect(messages.some(msg => msg.includes('Is confused a positive or negative feeling?'))).toBe(true);
        });
    });

    describe('Synonym Recognition', () => {
        beforeEach(() => {
            const script = `
                synonyms "hello" : hi, hey, greetings
                synonyms "goodbye" : bye, farewell, ciao

                recognizer "hello"
                    say "Hello to you too!"

                recognizer "goodbye"
                    say "See you later!"
            `;
            agent.merge(script, 'testbot');
        });

        test('should recognize synonyms', () => {
            messages = [];
            agent.input('hi', 'testbot');
            expect(messages).toContain("Hello to you too!");

            messages = [];
            agent.input('hey', 'testbot');
            expect(messages).toContain("Hello to you too!");

            messages = [];
            agent.input('bye', 'testbot');
            expect(messages).toContain("See you later!");
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed script gracefully', () => {
            const malformedScript = `
                recognizer "hello
                    say "missing quote"
            `;

            const result = agent.merge(malformedScript, 'testbot');
            expect(result).toBeTruthy(); // Should return error message
            expect(typeof result).toBe('string');
        });

        test('should handle empty input', () => {
            const script = `
                recognizer "[anything]"
                    say "I heard something."
            `;
            agent.merge(script, 'testbot');

            expect(() => {
                agent.input('', 'testbot');
            }).not.toThrow();
        });
    });
});