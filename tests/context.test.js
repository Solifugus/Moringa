/**
 * Context System Tests for Moringa Engine
 *
 * Tests for context switching, context isolation,
 * cascading interpretation, and context-specific behavior.
 */

const { Moringa } = require('../moringa.js');

describe('Moringa Context System', () => {
    let agent;
    let messages;

    beforeEach(() => {
        messages = [];
        agent = new Moringa((msg) => messages.push(msg), 'testbot');
    });

    describe('Basic Context Management', () => {
        test('should have general context by default', () => {
            expect(agent.model.testbot.contexts.length).toBe(1);
            expect(agent.model.testbot.contexts[0].name).toBe('general');
            expect(agent.model.testbot.contexts[0].active).toBe(true);
        });

        test('should create new contexts', () => {
            const script = `
                context "conversation"
                    recognizer "start talking"
                        say "Let's chat!"

                context "business"
                    recognizer "let's do business"
                        say "Time for business!"
            `;

            agent.merge(script, 'testbot');

            // Should have general + 2 new contexts
            expect(agent.model.testbot.contexts.length).toBe(3);
            expect(agent.model.testbot.contexts.map(c => c.name)).toContain('conversation');
            expect(agent.model.testbot.contexts.map(c => c.name)).toContain('business');
        });
    });

    describe('Context Activation and Deactivation', () => {
        beforeEach(() => {
            const script = `
                context "cooking"
                    recognizer "enter kitchen"
                        enter "cooking"
                        say "Entering cooking mode!"

                    recognizer "what can i cook"
                        say "You can make pasta, salad, or soup."

                    recognizer "leave kitchen"
                        exit "cooking"
                        say "Leaving cooking mode."

                recognizer "what can i cook"
                    say "I don't know about cooking."

                recognizer "general help"
                    say "This is general help."
            `;

            agent.merge(script, 'testbot');
        });

        test('should activate context and use context-specific responses', () => {
            // Before entering context
            messages = [];
            agent.input('what can i cook', 'testbot');
            expect(messages).toContain("I don't know about cooking.");

            // Enter context
            messages = [];
            agent.input('enter kitchen', 'testbot');
            expect(messages).toContain("Entering cooking mode!");

            // After entering context
            messages = [];
            agent.input('what can i cook', 'testbot');
            expect(messages).toContain("You can make pasta, salad, or soup.");

            // General commands should still work
            messages = [];
            agent.input('general help', 'testbot');
            expect(messages).toContain("This is general help.");
        });

        test('should deactivate context and revert to general responses', () => {
            // Enter context first
            agent.input('enter kitchen', 'testbot');

            // Verify context is active
            messages = [];
            agent.input('what can i cook', 'testbot');
            expect(messages).toContain("You can make pasta, salad, or soup.");

            // Exit context
            messages = [];
            agent.input('leave kitchen', 'testbot');
            expect(messages).toContain("Leaving cooking mode.");

            // Should revert to general response
            messages = [];
            agent.input('what can i cook', 'testbot');
            expect(messages).toContain("I don't know about cooking.");
        });
    });

    describe('Context Priority and Cascading', () => {
        beforeEach(() => {
            const script = `
                context "specific"
                    recognizer "hello"
                        say "Hello from specific context!"

                context "general"
                    recognizer "hello"
                        say "Hello from general context!"

                recognizer "hello"
                    say "Hello from default!"

                recognizer "activate specific"
                    enter "specific"
                    say "Specific context activated."
            `;

            agent.merge(script, 'testbot');
        });

        test('should prioritize active context over general', () => {
            // Default response
            messages = [];
            agent.input('hello', 'testbot');
            expect(messages).toContain("Hello from default!");

            // Activate specific context
            messages = [];
            agent.input('activate specific', 'testbot');
            expect(messages).toContain("Specific context activated.");

            // Should now use specific context
            messages = [];
            agent.input('hello', 'testbot');
            expect(messages).toContain("Hello from specific context!");
        });
    });

    describe('Multiple Active Contexts', () => {
        beforeEach(() => {
            const script = `
                context "formal"
                    recognizer "goodbye"
                        say "Farewell, have a pleasant day."

                context "casual"
                    recognizer "goodbye"
                        say "See ya later!"

                recognizer "be formal"
                    enter "formal"
                    say "Switching to formal mode."

                recognizer "be casual"
                    enter "casual"
                    say "Switching to casual mode."

                recognizer "goodbye"
                    say "Bye!"
            `;

            agent.merge(script, 'testbot');
        });

        test('should handle most recently activated context first', () => {
            // Activate formal first
            messages = [];
            agent.input('be formal', 'testbot');
            expect(messages).toContain("Switching to formal mode.");

            messages = [];
            agent.input('goodbye', 'testbot');
            expect(messages).toContain("Farewell, have a pleasant day.");

            // Then activate casual (should override)
            messages = [];
            agent.input('be casual', 'testbot');
            expect(messages).toContain("Switching to casual mode.");

            messages = [];
            agent.input('goodbye', 'testbot');
            expect(messages).toContain("See ya later!");
        });
    });

    describe('Context-Specific Memory and Data', () => {
        beforeEach(() => {
            const script = `
                context "work"
                    recognizer "enter work mode"
                        enter "work"
                        remember "current context is work"
                        say "Entering work mode."

                    recognizer "what context am i in"
                        recall "current context is [context]"
                        say "You are in [context] context."

                context "home"
                    recognizer "enter home mode"
                        enter "home"
                        remember "current context is home"
                        say "Entering home mode."

                    recognizer "what context am i in"
                        recall "current context is [context]"
                        say "You are in [context] context."

                recognizer "what context am i in"
                    say "You are in the general context."
            `;

            agent.merge(script, 'testbot');
        });

        test('should maintain context-specific memory', () => {
            // Enter work context
            messages = [];
            agent.input('enter work mode', 'testbot');
            expect(messages).toContain("Entering work mode.");

            // Check context memory
            messages = [];
            agent.input('what context am i in', 'testbot');
            expect(messages).toContain("You are in work context.");

            // Switch to home context
            messages = [];
            agent.input('enter home mode', 'testbot');
            expect(messages).toContain("Entering home mode.");

            // Should now show home context
            messages = [];
            agent.input('what context am i in', 'testbot');
            expect(messages).toContain("You are in home context.");
        });
    });

    describe('Context Isolation', () => {
        beforeEach(() => {
            const script = `
                context "private"
                    recognizer "secret [info]"
                        remember "secret is [info]"
                        say "Secret stored in private context."

                    recognizer "what is the secret"
                        recall "secret is [secret]"
                        say "The secret is: [secret]"

                context "public"
                    recognizer "enter public"
                        enter "public"
                        say "Entering public context."

                    recognizer "what is the secret"
                        say "I don't know any secrets in public."

                recognizer "enter private"
                    enter "private"
                    say "Entering private context."
            `;

            agent.merge(script, 'testbot');
        });

        test('should isolate information between contexts', () => {
            // Enter private context and store secret
            agent.input('enter private', 'testbot');

            messages = [];
            agent.input('secret password123', 'testbot');
            expect(messages).toContain("Secret stored in private context.");

            // Verify secret is accessible in private context
            messages = [];
            agent.input('what is the secret', 'testbot');
            expect(messages).toContain("The secret is: password123");

            // Switch to public context
            messages = [];
            agent.input('enter public', 'testbot');
            expect(messages).toContain("Entering public context.");

            // Secret should not be accessible
            messages = [];
            agent.input('what is the secret', 'testbot');
            expect(messages).toContain("I don't know any secrets in public.");
        });
    });

    describe('Error Handling in Context System', () => {
        test('should handle entering non-existent context gracefully', () => {
            const script = `
                recognizer "enter nonexistent"
                    enter "nonexistent"
                    say "Trying to enter nonexistent context."
            `;

            agent.merge(script, 'testbot');

            expect(() => {
                agent.input('enter nonexistent', 'testbot');
            }).not.toThrow();
        });

        test('should handle exiting inactive context gracefully', () => {
            const script = `
                context "test"
                    recognizer "test command"
                        say "In test context."

                recognizer "exit test"
                    exit "test"
                    say "Exiting test context."
            `;

            agent.merge(script, 'testbot');

            expect(() => {
                agent.input('exit test', 'testbot'); // Exit without entering
            }).not.toThrow();
        });
    });
});