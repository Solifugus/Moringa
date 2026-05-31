/**
 * Timing and Scheduling Tests for Moringa Engine
 *
 * Tests for scheduled messages, timing functionality,
 * and expectation handling.
 */

const { Moringa } = require('../moringa.js');

describe('Moringa Timing and Scheduling', () => {
    let agent;
    let messages;

    beforeEach(() => {
        messages = [];
        agent = new Moringa((msg) => messages.push(msg), 'testbot');
    });

    describe('Scheduled Actions', () => {
        test('should schedule messages with "in" timing', (done) => {
            const script = `
                recognizer "set timer for [seconds] seconds"
                    say "Timer set for [seconds] seconds."
                    say "Time is up!" in "[seconds] seconds"
            `;

            agent.merge(script, 'testbot');

            // Set a 100ms timer (0.1 seconds)
            agent.input('set timer for 0.1 seconds', 'testbot');

            expect(messages).toContain("Timer set for 0.1 seconds.");

            // Wait for scheduled message
            setTimeout(() => {
                expect(messages).toContain("Time is up!");
                done();
            }, 200); // Wait 200ms to ensure the scheduled message was sent
        });

        test('should handle multiple scheduled actions', (done) => {
            const script = `
                recognizer "test multiple timers"
                    say "First message" in "0.1 seconds"
                    say "Second message" in "0.2 seconds"
                    say "Third message" in "0.3 seconds"
            `;

            agent.merge(script, 'testbot');
            agent.input('test multiple timers', 'testbot');

            setTimeout(() => {
                expect(messages).toContain("First message");
                expect(messages).toContain("Second message");
                expect(messages).toContain("Third message");
                done();
            }, 500);
        });
    });

    describe('Sequence Execution', () => {
        test('should execute sequences immediately', () => {
            const script = `
                sequence "greeting"
                    say "Hello!"
                    say "How are you?"
                    say "Nice to meet you!"

                recognizer "greet me"
                    do "greeting"
            `;

            agent.merge(script, 'testbot');
            agent.input('greet me', 'testbot');

            expect(messages).toContain("Hello!");
            expect(messages).toContain("How are you?");
            expect(messages).toContain("Nice to meet you!");
        });

        test('should execute sequences with timing', (done) => {
            const script = `
                sequence "delayed greeting"
                    say "First part"
                    say "Second part"

                recognizer "delayed greet"
                    say "Starting delayed greeting"
                    do "delayed greeting" in "0.1 seconds"
            `;

            agent.merge(script, 'testbot');
            agent.input('delayed greet', 'testbot');

            expect(messages).toContain("Starting delayed greeting");
            expect(messages).not.toContain("First part"); // Should not be immediate

            setTimeout(() => {
                expect(messages).toContain("First part");
                expect(messages).toContain("Second part");
                done();
            }, 200);
        });
    });

    describe('Expectation System', () => {
        beforeEach(() => {
            const script = `
                recognizer "do you want coffee"
                    say "Would you like coffee?"
                    expect "yes" as "I would love some coffee"
                    expect "no" as "I don't want coffee"

                recognizer "i would love some coffee"
                    say "Great! I'll make you some coffee."

                recognizer "i don't want coffee"
                    say "No problem, maybe later."
            `;
            agent.merge(script, 'testbot');
        });

        test('should handle expected responses', () => {
            // Ask the question
            messages = [];
            agent.input('do you want coffee', 'testbot');
            expect(messages).toContain("Would you like coffee?");

            // Respond with expected answer
            messages = [];
            agent.input('yes', 'testbot');
            expect(messages).toContain("Great! I'll make you some coffee.");
        });

        test('should handle negative expected responses', () => {
            // Ask the question
            messages = [];
            agent.input('do you want coffee', 'testbot');
            expect(messages).toContain("Would you like coffee?");

            // Respond with negative answer
            messages = [];
            agent.input('no', 'testbot');
            expect(messages).toContain("No problem, maybe later.");
        });

        test('should handle unexpected responses after expectation', () => {
            // Ask the question
            messages = [];
            agent.input('do you want coffee', 'testbot');
            expect(messages).toContain("Would you like coffee?");

            // Respond with unexpected answer
            messages = [];
            agent.input('what is the weather like', 'testbot');
            // Should not trigger coffee responses
            expect(messages).not.toContain("Great! I'll make you some coffee.");
            expect(messages).not.toContain("No problem, maybe later.");
        });
    });

    describe('Schedule Management', () => {
        test('should track scheduled items', () => {
            const script = `
                recognizer "schedule test"
                    say "Scheduling message" in "10 seconds"
            `;

            agent.merge(script, 'testbot');
            agent.input('schedule test', 'testbot');

            // Check that there's a scheduled item
            expect(agent.model.testbot.schedules.length).toBeGreaterThan(0);
            expect(agent.model.testbot.schedules[0].performed).toBe(false);
        });

        test('should clean up performed scheduled items', (done) => {
            const script = `
                recognizer "quick schedule"
                    say "Immediate response"
                    say "Scheduled response" in "0.1 seconds"
            `;

            agent.merge(script, 'testbot');
            agent.input('quick schedule', 'testbot');

            // Initially should have unperformed schedule
            expect(agent.model.testbot.schedules.some(s => !s.performed)).toBe(true);

            setTimeout(() => {
                // After execution, should be marked as performed
                expect(agent.model.testbot.schedules.some(s => s.performed)).toBe(true);
                done();
            }, 200);
        });
    });

    describe('Complex Timing Scenarios', () => {
        test('should handle overlapping schedules', (done) => {
            const script = `
                recognizer "overlap test"
                    say "Message A" in "0.1 seconds"
                    say "Message B" in "0.15 seconds"
                    say "Message C" in "0.2 seconds"
            `;

            agent.merge(script, 'testbot');
            agent.input('overlap test', 'testbot');

            let messageOrder = [];

            // Override the callback to track message order
            agent.callback = (msg) => {
                messages.push(msg);
                messageOrder.push(msg);
            };

            setTimeout(() => {
                expect(messageOrder).toContain("Message A");
                expect(messageOrder).toContain("Message B");
                expect(messageOrder).toContain("Message C");

                // Check order (A should come before B, B before C)
                const aIndex = messageOrder.indexOf("Message A");
                const bIndex = messageOrder.indexOf("Message B");
                const cIndex = messageOrder.indexOf("Message C");

                expect(aIndex).toBeLessThan(bIndex);
                expect(bIndex).toBeLessThan(cIndex);
                done();
            }, 400);
        });

        test('should handle variable substitution in scheduled messages', (done) => {
            const script = `
                recognizer "remind me about [topic] in [time] seconds"
                    say "Setting reminder about [topic]"
                    say "Reminder: Don't forget about [topic]!" in "[time] seconds"
            `;

            agent.merge(script, 'testbot');
            agent.input('remind me about the meeting in 0.1 seconds', 'testbot');

            expect(messages).toContain("Setting reminder about the meeting");

            setTimeout(() => {
                expect(messages).toContain("Reminder: Don't forget about the meeting!");
                done();
            }, 200);
        });
    });
});