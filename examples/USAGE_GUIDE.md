# Moringa Chatbot Script Collection - Usage Guide

Welcome to the comprehensive Moringa chatbot script examples collection! This guide will help you understand how to use, combine, and customize the various script components to build powerful conversational AI personalities.

## 📁 Collection Structure

```
examples/
├── tutorials/           # Learn Moringa script basics step by step
├── essential-components/# Reusable building blocks for any bot
├── complete-examples/   # Full personality bots demonstrating integration
├── data-collections/    # Conversational content that works across personalities
├── console.js          # Interactive testing tool
└── USAGE_GUIDE.md      # This guide
```

## 🎓 Getting Started with Tutorials

**Start here if you're new to Moringa scripting.**

### Learning Path:
1. **hello-world.pgm** - Your first Moringa script
   ```bash
   node console.js tutorials/hello-world.pgm
   ```
   - Learn basic `Recognizer`, `Remember`, and `Say` commands
   - Understand script structure and comments

2. **memory-basics.pgm** - How chatbots remember things
   ```bash
   node console.js tutorials/memory-basics.pgm
   ```
   - Discover the `Remember` system for context awareness
   - See how memory influences conversation flow

3. **context-demo.pgm** - Advanced conversation patterns
   ```bash
   node console.js tutorials/context-demo.pgm
   ```
   - Explore conditional responses using `Option Say`
   - Learn pattern matching and conversation branching

4. **complete-starter.pgm** - Put it all together
   ```bash
   node console.js tutorials/complete-starter.pgm
   ```
   - See all concepts working together in a functional bot
   - Template for building your own chatbot

## 🧱 Essential Components

**Reusable modules that enhance any chatbot personality.**

### Core Components:

#### 100.pgm - Conversational Foundation
```bash
node console.js essential-components/100.pgm
```
- 100+ universal conversation patterns
- Greetings, farewells, politeness, emotions
- Works with any personality - always include this

#### time-scheduling.pgm - Time Intelligence
```bash
node console.js essential-components/time-scheduling.pgm
```
- Date/time awareness and scheduling capabilities
- Event planning and reminder patterns
- Perfect for productivity and assistant bots

#### fact-master.pgm - Knowledge Engine
```bash
node console.js essential-components/fact-master.pgm
```
- Educational content delivery system
- Science, history, and trivia patterns
- Ideal for learning and educational bots

#### fallbacks.pgm - Robust Handling
```bash
node console.js essential-components/fallbacks.pgm
```
- Graceful handling of unrecognized input
- Error recovery and redirection patterns
- Essential for professional bot deployments

### Integration Strategy:
- **Always start with 100.pgm** for basic conversation flow
- **Add components based on your bot's purpose**
- **Include fallbacks.pgm** for robust user experience
- **Test combinations** to ensure patterns work together

## 🤖 Complete Personality Examples

**Full-featured bots demonstrating component integration and distinct conversational styles.**

### Available Personalities:

#### Study Buddy - Academic Learning Companion
```bash
node console.js complete-examples/study-buddy.pgm
```
**Try:** "help me study", "I have an exam", "teach me"
- **Focus:** Academic support, learning strategies, test preparation
- **Tone:** Encouraging, educational, goal-oriented
- **Integration:** Uses motivational patterns with educational focus

#### Helpful Assistant - Professional Support Bot
```bash
node console.js complete-examples/helpful-assistant.pgm
```
**Try:** "I need help", "schedule meeting", "organize tasks"
- **Focus:** Task management, organization, professional productivity
- **Tone:** Efficient, professional, solution-focused
- **Integration:** Combines time-scheduling with task-oriented responses

#### Therapist Bot - Emotional Support Companion
```bash
node console.js complete-examples/therapist-bot.pgm
```
**Try:** "I'm feeling anxious", "need someone to talk to", "having a hard time"
- **Focus:** Emotional support, active listening, mental wellness
- **Tone:** Compassionate, non-judgmental, supportive
- **Integration:** Emphasizes emotional recognition and empathetic responses

#### Casual Friend - Relaxed Social Companion
```bash
node console.js complete-examples/casual-friend.pgm
```
**Try:** "what's up", "any plans this weekend", "seen any good movies"
- **Focus:** Social conversation, entertainment, daily life topics
- **Tone:** Laid-back, friendly, conversational
- **Integration:** Heavy use of small-talk topics and casual interactions

## 📚 Data Collections

**Conversational content libraries that work across any personality.**

### Universal Content:

#### Small Talk Topics
```bash
node console.js data-collections/small-talk-topics.pgm
```
**Try:** "weather", "movie", "food", "weekend plans", "hobbies"
- **Coverage:** Weather, entertainment, food, travel, technology, daily life
- **Usage:** Perfect for any bot that needs engaging conversation starters
- **Integration:** Mix with personality-specific patterns for natural flow

#### Common Facts & Trivia
```bash
node console.js data-collections/common-facts.pgm
```
**Try:** "science fact", "space", "animals", "fun fact"
- **Coverage:** Science, space, animals, fun trivia, educational content
- **Usage:** Add educational value to any conversation
- **Integration:** Enhances learning bots, adds depth to casual conversation

### Data Collection Strategy:
- **Use as base content** for any personality
- **Customize tone** by editing response patterns to match your bot's style
- **Combine multiple collections** for richer conversational possibilities
- **Add personality-specific data** on top of universal collections

## 🧪 Testing Your Scripts

### Using Console.js Interactive Tool

#### Basic Testing:
```bash
node console.js your-script.pgm
```
Type messages to test conversation patterns interactively.

#### Quick Pattern Testing:
```bash
echo "test phrase" | node console.js your-script.pgm
```
Test specific patterns without interactive mode.

#### Testing Multiple Patterns:
```bash
echo "hello" | node console.js your-script.pgm
echo "help" | node console.js your-script.pgm
echo "goodbye" | node console.js your-script.pgm
```

### Testing Checklist:
- ✅ Script loads without errors
- ✅ Basic greetings work ("hello", "hi")
- ✅ Help patterns respond ("help", "I need help")
- ✅ Farewells work ("goodbye", "bye")
- ✅ Core functionality patterns work
- ✅ Fallback patterns handle unrecognized input

## 🔧 Building Custom Personalities

### Step-by-Step Process:

#### 1. Choose Your Foundation
```bash
# Copy a working script as starting point
cp complete-examples/helpful-assistant.pgm my-custom-bot.pgm
```

#### 2. Define Your Bot's Personality
- **Purpose:** What is your bot designed to help with?
- **Tone:** Professional, casual, encouraging, playful?
- **Target Audience:** Students, professionals, general users?

#### 3. Integrate Essential Components
```javascript
// In your script, add comments showing component integration:
-- Base conversation patterns from 100.pgm
-- Time/scheduling from time-scheduling.pgm  
-- Educational content from fact-master.pgm
-- Error handling from fallbacks.pgm
```

#### 4. Add Data Collections
```javascript
-- Small talk topics from small-talk-topics.pgm
-- Educational facts from common-facts.pgm
```

#### 5. Customize Response Style
Edit the `Say` statements to match your personality:
```javascript
// Generic:
Option Say "I can help with that."

// Study Buddy style:
Option Say "I'm excited to help you learn this! Let's break it down step by step."

// Casual Friend style:
Option Say "Sure thing! I've got you covered."
```

#### 6. Test and Refine
```bash
node console.js my-custom-bot.pgm
```

### Customization Tips:
- **Start with working examples** rather than building from scratch
- **Keep the personality consistent** across all response patterns
- **Test frequently** during development
- **Use the comment sections** to organize your patterns logically
- **Study existing examples** to understand effective pattern design

## 🎯 Best Practices

### Script Organization:
- **Use clear comment headers** to organize pattern sections
- **Group related patterns together** (greetings, help, farewells, etc.)
- **Include example phrases** in comments for testing
- **Document your bot's purpose** at the top of the file

### Pattern Design:
- **Make recognizers specific enough** to avoid false matches
- **Provide multiple response options** for variety
- **Use appropriate Remember statements** to track conversation context
- **Include personality-appropriate language** in all responses

### Testing Strategy:
- **Test common conversation flows** end-to-end
- **Verify pattern matching** with various phrasings
- **Check for conflicts** between different pattern sets
- **Ensure graceful fallback handling** for unrecognized input

### Integration Guidelines:
- **Always include 100.pgm patterns** for basic conversation
- **Choose components that match** your bot's purpose
- **Customize data collection responses** to fit your personality
- **Test component combinations** to avoid pattern conflicts

## 🚀 Advanced Usage

### Combining Multiple Personalities:
Create hybrid bots by mixing patterns from different examples:
```javascript
-- Professional efficiency from helpful-assistant.pgm
-- Learning support from study-buddy.pgm  
-- Casual conversation from casual-friend.pgm
```

### Creating Domain-Specific Bots:
- **Medical Assistant:** helpful-assistant.pgm + medical fact collections
- **Fitness Buddy:** casual-friend.pgm + exercise/nutrition patterns
- **Creative Companion:** therapist-bot.pgm + art/writing encouragement patterns

### Building Bot Families:
Create multiple related bots with shared components but different specializations:
- All use 100.pgm + fallbacks.pgm for consistency
- Each has unique personality patterns and specialized data collections
- Shared components ensure familiar interaction patterns across the family

## 📖 Learning Resources

### Understanding Moringa Script Language:
- **Recognizer:** Pattern matching for user input
- **Remember:** Context tracking and memory
- **Say/Option Say:** Response generation with variety
- **Comments:** Documentation and organization (lines starting with --)

### Pattern Matching Tips:
- **Exact phrases:** "hello" matches only "hello"
- **Partial matches:** "help" matches "help", "help me", "I need help"
- **Case insensitive:** "Hello", "HELLO", "hello" all match "hello"

### Memory System:
- **Remember statements** create conversational context
- **Previous memories** can influence future responses
- **Use specific memory keys** for better conversation tracking

## 🔍 Troubleshooting

### Common Issues:

#### Script Won't Load:
- Check file encoding (copy from working examples)
- Verify syntax in comments and commands
- Ensure proper file structure

#### Patterns Don't Match:
- Test exact phrases from recognizer patterns
- Check for typos in recognizer strings
- Verify pattern specificity vs. user input

#### Responses Seem Wrong:
- Check which patterns are actually matching
- Verify Option Say variety is working
- Test memory context influence

#### Integration Conflicts:
- Look for overlapping recognizer patterns
- Test components individually, then combined
- Use specific rather than generic pattern phrases

## 🎉 Conclusion

This collection provides everything you need to build sophisticated Moringa chatbots:

- **Learn** with progressive tutorials
- **Build** using proven essential components  
- **Customize** by studying complete personality examples
- **Enhance** with universal data collections
- **Test** with the interactive console tool
- **Scale** by following best practices

Start with the tutorials, explore the examples, and begin building your own unique conversational AI personalities!

---

**Happy Bot Building!** 🤖✨

For questions or contributions, explore the codebase and test different combinations to discover new possibilities.