# Moringa Chatbot Engine

Moringa is a sophisticated chatbot engine designed as a foundation for chatbot functionality in software projects. Unlike conventional chatbot engines, Moringa is capable of **deductive reasoning** and uses a rich variety of heuristics and interactive capabilities.

[![Tests](https://img.shields.io/badge/tests-38%2F38%20passing-brightgreen)](tests/)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](tests/)
[![License](https://img.shields.io/badge/license-LGPL--3.0-blue)](LICENSE)

## 🚀 Features

- **🧠 Deductive Reasoning**: Advanced logical inference capabilities
- **🔄 Contextual Interpretation**: Cascading context switching with exclusive activation
- **💾 Memory Management**: Context-specific memory storage and recall
- **🔗 Sequence Abstraction**: Reusable command sequences and workflows
- **⏰ Temporal Scheduling**: Time-based actions and delayed responses
- **🎯 Conditional Logic**: Seeking/avoiding conditions with boolean evaluation
- **🤔 Contemplations**: Deep reasoning and reflection capabilities
- **🔤 Rich Pattern Matching**: Advanced variable capture and substitution

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Script Reference](#script-reference)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## 💾 Installation

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn

### Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Solifugus/Moringa.git
cd Moringa

# Install dependencies
npm install
```

### Required Dependencies

- `retokenizer`: Text tokenization and pattern matching
- `datejs`: Advanced date/time parsing and manipulation

## 🚀 Quick Start

```javascript
const { Moringa } = require('./moringa.js');

// Create a new Moringa agent
const agent = new Moringa((message) => {
    console.log('Bot:', message);
}, 'mybot');

// Load a basic script
const script = `
    recognizer "hello"
        say "Hello! Nice to meet you."
        
    recognizer "my name is [name]"
        remember "user name is [name]"
        say "Nice to meet you, [name]!"
        
    recognizer "what is my name"
        recall "user name is [name]"
        say "Your name is [name]."
`;

agent.merge(script, 'mybot');

// Interact with the agent
agent.input('hello', 'mybot');
agent.input('my name is Alice', 'mybot');
agent.input('what is my name', 'mybot');
```

## 📖 Usage Examples

### Context Switching

```javascript
const contextScript = `
    context "work"
        recognizer "enter work mode"
            enter "work"
            say "Switching to work context."
            
        recognizer "what should i do"
            say "Focus on your tasks and be productive!"
            
    context "casual" 
        recognizer "enter casual mode"
            enter "casual"
            say "Switching to casual context."
            
        recognizer "what should i do"
            say "Relax and enjoy yourself!"
            
    recognizer "what should i do"
        say "I'm not sure what context you're in."
`;
```

### Scheduled Actions

```javascript
const timerScript = `
    recognizer "set timer for [duration] [unit]"
        say "Timer set for [duration] [unit]."
        say "Time's up!" in "[duration] [unit]"
        
    recognizer "remind me about [task] in [time] minutes"
        say "I'll remind you about [task]."
        say "Reminder: Don't forget about [task]!" in "[time] minutes"
`;
```

### Memory and Recall

```javascript
const memoryScript = `
    recognizer "remember [fact]"
        remember "[fact]"
        say "I'll remember that [fact]."
        
    recognizer "what do you remember about [topic]"
        recall "[topic] is [detail]"
        say "I remember that [topic] is [detail]."
        
    recognizer "forget about [topic]"
        forget "[topic]"
        say "I've forgotten about [topic]."
`;
```

## 📚 Script Reference

### Core Directives

#### Memory Initialization
```
Memories
    "good is a feeling"
    "good is positive"
    "bad is negative"
```

#### Conjugations
```
Conjugate "I" And "you"
Conjugate "my" And "your"
Conjugate "I'm" To "you are"
```

#### Synonyms
```
Synonym yes: yep, yeah, sure
Synonym no: nope, nah
```

#### Sequences
```
Sequence "greeting"
    say "Hello there!"
    say "How are you today?"
    say "What can I help you with?"
```

### Recognizers and Patterns

#### Basic Recognition
```
recognizer "hello"
    say "Hi there!"
```

#### Variable Capture
```
recognizer "I like [thing]"
    say "That's great! [thing] sounds interesting."
    
recognizer "I am [age] years old"
    remember "user age is [age]"
    say "Nice to know you're [age]!"
```

#### Choice Variables
```
recognizer "I fix [item:cars,computers,phones]"
    say "Great! I need help with my [item]."
```

### Action Commands

#### Communication
```
say "Hello world!"                    # Immediate response
say "Delayed message" in "5 seconds"  # Scheduled response
say "Daily reminder" at "9:00 AM"     # Time-based response
```

#### Memory Operations
```
remember "user likes coffee"          # Store memory
recall "user likes [drink]"           # Retrieve memory
forget "old information"              # Remove memory
```

#### Context Management
```
enter "work"                          # Activate context
exit "casual"                         # Deactivate context
```

#### Flow Control
```
do "greeting"                         # Execute sequence
expect "yes" as "I agree"             # Set expectation
interpret as "I'm tired"              # Reinterpret input
```

#### Conditional Logic
```
always if "user is new":
    say "Welcome, newcomer!"
    
option if "user is experienced":
    say "Welcome back, expert!"
    
open:
    say "Hello there!"
```

### Contexts

Contexts provide scoped interpretation and exclusive activation:

```
context "cooking"
    recognizer "what can i make"
        say "You could make pasta, salad, or soup."
        
    recognizer "enter kitchen"
        enter "cooking"
        say "Entering cooking mode!"
        
    recognizer "leave kitchen"  
        exit "cooking"
        say "Leaving cooking mode."

# Global fallback        
recognizer "what can i make"
    say "I don't know about cooking."
```

## 🛠 Development

### Project Structure

```
Moringa/
├── moringa.js           # Main engine
├── package.json         # Dependencies
├── jest.config.js       # Test configuration
├── tests/               # Test suite
│   ├── moringa.test.js  # Core functionality tests
│   ├── context.test.js  # Context system tests
│   ├── timing.test.js   # Scheduling tests
│   └── setup.js         # Test utilities
├── examples/            # Example scripts and utilities
│   ├── traits/          # Chatbot personality templates
│   ├── console.js       # Interactive console
│   ├── example.js       # Basic usage example
│   └── *.pgm            # Moringa script examples
├── docs/                # Documentation
│   ├── design.txt       # Architecture notes
│   └── advice.txt       # Development guidance
└── utils/               # Development utilities
```

### Running the Interactive Console

```bash
node examples/console.js
```

This provides an interactive environment for testing Moringa scripts.

## 🧪 Testing

Moringa includes a comprehensive test suite with **100% coverage** and **38 passing tests**.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/context.test.js
```

### Test Categories

- **Core Engine Tests**: Pattern recognition, variable substitution, memory operations
- **Context System Tests**: Context switching, isolation, cascading interpretation  
- **Timing Tests**: Scheduled actions, sequence execution, expectation handling
- **Integration Tests**: End-to-end scenarios and complex interactions

### Test Coverage

The test suite covers:
- ✅ Pattern recognition and variable capture
- ✅ Memory storage and recall with context isolation
- ✅ Context switching and exclusive activation
- ✅ Scheduled actions and timing functionality
- ✅ Boolean condition evaluation
- ✅ Error handling and edge cases
- ✅ Sequence execution and flow control
- ✅ Expectation system and user interaction

## 📁 Examples

The `examples/` directory contains:

- **traits/**: Pre-built personality templates and conversation styles
  - `eliza.pgm`: ELIZA-style therapeutic responses
  - `rogerianism.pgm`: Rogerian therapy techniques
  - `smalltalk.pgm`: Casual conversation patterns
  - `cliche.pgm`: Common phrase responses
- **Script Examples**: Demonstration scripts showing various features
- **Interactive Tools**: Console applications for testing

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Write tests** for new functionality
4. **Ensure** all tests pass (`npm test`)
5. **Commit** changes (`git commit -m 'Add amazing feature'`)
6. **Push** to branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Development Guidelines

- Maintain 100% test coverage
- Follow existing code style and conventions
- Add JSDoc comments for public APIs
- Update documentation for new features
- Test across different Node.js versions

## 📄 License

This project is licensed under the **GNU Lesser General Public License v3.0** (LGPL-3.0).

- ✅ **Commercial use** allowed
- ✅ **Modification** allowed  
- ✅ **Distribution** allowed
- ✅ **Patent use** allowed
- ❌ **Liability** protection
- ❌ **Warranty** provided

See [LICENSE](LICENSE) for the full license text.

## 🔗 Links

- **Repository**: https://github.com/Solifugus/Moringa
- **Issues**: https://github.com/Solifugus/Moringa/issues
- **Documentation**: [docs/](docs/)
- **Examples**: [examples/](examples/)

---

**Built with ❤️ by the Moringa team**