# Moringa Script Examples

This directory contains the organized collection of Moringa script examples and components.

## 📁 Directory Structure

### `tutorials/` 🎓
Progressive learning examples from simple to complex:
- `hello-world.pgm` - Ultra-simple introduction
- `memory-basics.pgm` - Remember/recall demonstration  
- `context-demo.pgm` - Context switching basics
- `complete-starter.pgm` - Functional mini-bot

### `components/` 🧩
Reusable building blocks for any bot:
- `conjugations.pgm` ✅ - Person/pronoun conjugations
- `100.pgm` - 100 most common conversational patterns
- `time-scheduling.pgm` - Timer and scheduling functionality
- `fact-master.pgm` - Fact storage and recall patterns
- `fallbacks.pgm` - Graceful error handling

### `personalities/` 🤖
Complete working bot examples:
- `helpful-assistant.pgm` - General purpose helper
- `therapist-bot.pgm` - Therapeutic conversation
- `casual-friend.pgm` - Social interaction
- `study-buddy.pgm` - Educational assistant

### `databases/` 📚
Rich content collections:
- `cliche.pgm` ✅ - 3,602 English clichés and idioms
- `small-talk-topics.pgm` - Conversation starters
- `common-facts.pgm` - General knowledge

## 🚀 Usage Examples

### Load a complete bot
```bash
node console.js personalities/helpful-assistant.pgm
```

### Combine components
```bash
node console.js components/conjugations.pgm components/100.pgm personalities/casual-friend.pgm
```

### Tutorial progression  
```bash
node console.js tutorials/hello-world.pgm
node console.js tutorials/memory-basics.pgm
node console.js tutorials/context-demo.pgm
node console.js tutorials/complete-starter.pgm
```

## 📋 Development Status

**Completed:** ✅ Directory structure and organization  
**In Progress:** 🚧 Script development (see task list)

See [`archive/`](archive/) for original script collection and development history.