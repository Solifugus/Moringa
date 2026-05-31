# Getting Started with Moringa

This guide will help you get up and running with Moringa quickly.

## 1. Basic Setup

```javascript
const { Moringa } = require('./moringa.js');

// Create a new agent with a callback function
const bot = new Moringa((message) => {
    console.log('Bot says:', message);
}, 'mybot');
```

## 2. Your First Script

Create a simple interaction:

```javascript
const basicScript = `
    recognizer "hello"
        say "Hello! I'm a Moringa chatbot."
        
    recognizer "how are you"
        say "I'm doing great, thanks for asking!"
        
    recognizer "bye"
        say "Goodbye! Have a great day!"
`;

// Load the script into your bot
bot.merge(basicScript, 'mybot');

// Test it out
bot.input('hello', 'mybot');        // Bot says: Hello! I'm a Moringa chatbot.
bot.input('how are you', 'mybot');  // Bot says: I'm doing great, thanks for asking!
```

## 3. Using Variables

Capture and use information from user input:

```javascript
const variableScript = `
    recognizer "my name is [name]"
        remember "user name is [name]"
        say "Nice to meet you, [name]!"
        
    recognizer "what is my name"
        recall "user name is [username]"
        say "Your name is [username]."
        
    recognizer "I am [age] years old"
        remember "user age is [age]"
        say "Got it! You are [age] years old."
        
    recognizer "how old am i"
        recall "user age is [age]"
        say "You told me you are [age] years old."
`;

bot.merge(variableScript, 'mybot');

// Try it:
bot.input('my name is Alice', 'mybot');  // Bot says: Nice to meet you, Alice!
bot.input('what is my name', 'mybot');   // Bot says: Your name is Alice.
```

## 4. Context Switching

Create different conversation modes:

```javascript
const contextScript = `
    context "work"
        recognizer "enter work mode"
            enter "work"
            say "Switching to work mode. Let's be productive!"
            
        recognizer "what should i do"
            say "Focus on your tasks, stay organized, and meet your deadlines."
            
        recognizer "leave work"
            exit "work"
            say "Leaving work mode."

    context "fun"
        recognizer "enter fun mode"
            enter "fun"
            say "Fun mode activated! Let's have some fun!"
            
        recognizer "what should i do"
            say "Relax, play games, watch movies, or chat with friends!"
            
        recognizer "leave fun"
            exit "fun"
            say "Leaving fun mode."
            
    recognizer "what should i do"
        say "I'm not sure what context you're in. Try 'enter work mode' or 'enter fun mode'."
`;

bot.merge(contextScript, 'mybot');

// Test context switching:
bot.input('what should i do', 'mybot');     // General response
bot.input('enter work mode', 'mybot');      // Activates work context
bot.input('what should i do', 'mybot');     // Work-specific response
bot.input('enter fun mode', 'mybot');       // Switches to fun context
bot.input('what should i do', 'mybot');     // Fun-specific response
```

## 5. Scheduled Actions

Make your bot respond after a delay:

```javascript
const timingScript = `
    recognizer "set timer for [seconds] seconds"
        say "Timer set for [seconds] seconds."
        say "Time's up!" in "[seconds] seconds"
        
    recognizer "remind me about [task] in [minutes] minutes"
        say "I'll remind you about [task] in [minutes] minutes."
        say "Reminder: Don't forget about [task]!" in "[minutes] minutes"
`;

bot.merge(timingScript, 'mybot');

// Set a timer
bot.input('set timer for 3 seconds', 'mybot');
// Bot immediately says: "Timer set for 3 seconds."
// After 3 seconds: "Time's up!"
```

## 6. Conditional Logic

Make responses conditional on stored information:

```javascript
const conditionalScript = `
    recognizer "i like [food]"
        remember "user likes [food]"
        say "Great! I'll remember you like [food]."
        
    recognizer "what do you recommend"
        always if "user likes pizza":
            say "Since you like pizza, try the margherita!"
        option if "user likes sushi":
            say "How about some fresh salmon rolls?"
        open:
            say "I don't know your preferences yet. Tell me what you like!"
`;

bot.merge(conditionalScript, 'mybot');

// Test conditional responses
bot.input('what do you recommend', 'mybot');  // General response
bot.input('i like pizza', 'mybot');           // Stores preference
bot.input('what do you recommend', 'mybot');  // Pizza recommendation
```

## 7. Sequences and Reusable Actions

Create reusable command sequences:

```javascript
const sequenceScript = `
    sequence "morning_routine"
        say "Good morning!"
        say "Here's what you should do:"
        say "1. Drink a glass of water"
        say "2. Do some light stretching"
        say "3. Check your schedule"
        
    recognizer "start my day"
        do "morning_routine"
        
    recognizer "good morning"
        do "morning_routine"
`;

bot.merge(sequenceScript, 'mybot');

bot.input('good morning', 'mybot');
// Bot will say all 4 messages in the sequence
```

## 8. Running the Examples

Try the included examples:

```bash
# Interactive console
npm run console

# Run the basic example
npm run test:example

# Run the full test suite
npm test
```

## 9. Next Steps

- Explore the `examples/traits/` directory for advanced conversation patterns
- Read `docs/design.txt` for architectural insights
- Check out the comprehensive test suite in `tests/` for more usage patterns
- Review the full script reference in the main README.md

## Common Patterns

### User Information Storage
```javascript
recognizer "i am [age] and live in [city]"
    remember "user age is [age]"
    remember "user city is [city]"
    say "Got it! [age] years old in [city]."
```

### Choice Variables
```javascript
recognizer "i want [drink:coffee,tea,water]"
    say "One [drink] coming up!"
```

### Multiple Contexts
```javascript
context "customer_service"
    recognizer "i have a problem"
        say "I'm sorry to hear that. How can I help?"
        
context "sales"
    recognizer "i want to buy"
        say "Excellent! What are you interested in?"
```

Happy chatbot building! 🤖