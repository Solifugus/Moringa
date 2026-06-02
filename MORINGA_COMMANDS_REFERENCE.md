# 📚 MoringaScript Commands Reference

**Complete list of all MoringaScript commands and their current status**

---

## ✅ **CORE COMMANDS** (Fully Functional)

### **Pattern Matching & Response**
```moringa
recognizer "pattern [variable]" priority=10
    say "response with [variable]"
```
- **`recognizer`** - Define conversation patterns ✅ **WORKING**
- **`say`** - Bot responses with variable substitution ✅ **WORKING**

### **Memory & Variables**
```moringa
recognizer "my name is [name]"
    remember "user name is [name]" type="string" scope="session"
    
recognizer "forget my name"
    forget "user name"
```
- **`remember`** - Store information in memory ✅ **WORKING**
- **`forget`** - Remove stored information ✅ **WORKING**
- **`recall`** - Retrieve stored information ✅ **WORKING**

### **Interactive Questions**
```moringa
recognizer "help me"
    ask "What do you need help with?" expect="help_topic"
```
- **`ask`** - Ask questions and wait for responses ✅ **WORKING**

---

## ✅ **ADVANCED COMMANDS** (Phase 2-3 Enhanced)

### **Context Management**
```moringa
context "customer_service"
recognizer "billing question" context="customer_service"
    enter_context "billing"
    say "Let me help with billing"

context "billing"
recognizer "cancel" context="billing"
    exit_context
    say "Returning to main menu"
```
- **`context`** - Define conversation contexts ✅ **WORKING**
- **`enter_context`** - Switch to a context ✅ **WORKING**  
- **`exit_context`** - Exit current context ✅ **WORKING**

### **Conditional Logic**
```moringa
recognizer "check account"
    condition "user_authenticated == true"
        say "Your account balance is [balance]"
    condition "user_authenticated == false"
        say "Please log in first"
    otherwise
        say "Something went wrong"
```
- **`condition`** - If-then logic with comparisons ✅ **WORKING**
- **`otherwise`** - Else clause ✅ **WORKING**

### **Multiple Choice Options**
```moringa
recognizer "main menu"
    say "Choose an option:"
    option
        say "1. Account info"
    option if "premium_user == true"  
        say "2. Premium features"
    option
        say "3. Help"
```
- **`option`** - Multiple choice branches ✅ **WORKING**
- **`option if`** - Conditional options ✅ **WORKING**

---

## ✅ **PHASE 3 ENHANCED COMMANDS** (Advanced Features)

### **Variable Types & Validation**
```moringa
recognizer "my email is [email]"
    remember "user email is [email|lowercase]" type="email" scope="session"
    
recognizer "I'm [age] years old"
    remember "user age is [age]" type="integer" constraints="min=0,max=150"
```
- **Variable Types**: `string`, `number`, `integer`, `email`, `phone`, `url`, `date` ✅ **WORKING**
- **Variable Transformations**: `lowercase`, `uppercase`, `capitalize`, `title_case` ✅ **WORKING**
- **Variable Scoping**: `local`, `session`, `global`, `context` ✅ **WORKING**
- **Variable Constraints**: `min`, `max`, `length`, `pattern` ✅ **WORKING**

### **Advanced Conditionals**
```moringa
recognizer "check eligibility"
    condition "age >= 18 AND premium_member == true"
        say "You qualify for premium features"
    condition "age < 18"
        say "You must be 18 or older"
```
- **Comparison Operators**: `>`, `<`, `>=`, `<=`, `==`, `!=` ✅ **WORKING**
- **Logical Operators**: `AND`, `OR`, `NOT` ✅ **WORKING**
- **Nested Conditions**: Multiple levels of nesting ✅ **WORKING**

### **Pattern Priorities**
```moringa
recognizer "urgent help" priority=10
    say "Priority support activated"
    
recognizer "help" priority=5
    say "How can I help you?"
```
- **`priority`** - Pattern matching precedence ✅ **WORKING**

---

## ✅ **STATE MACHINE COMMANDS** (Phase 3)

### **State Management**
```moringa
state "greeting"
    onEnter
        say "Welcome! How can I help?"
    timeout 30s
        transition "timeout_state"

recognizer "billing" state="greeting"
    transition "billing_support"
    
state "billing_support"
    onEnter
        say "Billing department. What's your issue?"
```
- **`state`** - Define conversation states ✅ **WORKING**
- **`transition`** - Move between states ✅ **WORKING**
- **`onEnter`** - State entry actions ✅ **WORKING**
- **`onExit`** - State exit actions ✅ **WORKING**
- **`timeout`** - Automatic transitions after delay ✅ **WORKING**

---

## 🔧 **UTILITY COMMANDS**

### **Language Processing**
```moringa
synonyms "hello": "hi", "hey", "greetings"

conjugateAnd "run" to "running"
conjugateAnd "go" to "going"
```
- **`synonyms`** - Define word equivalents ✅ **WORKING**
- **`conjugateAnd`** - Verb conjugation rules ✅ **WORKING**
- **`conjugateTo`** - Advanced conjugation ✅ **WORKING**

### **Control Flow**
```moringa
recognizer "end chat"
    say "Goodbye!"
    end
    
recognizer "start over"
    restart
```
- **`end`** - End conversation ✅ **WORKING**
- **`restart`** - Restart conversation ✅ **WORKING**

---

## 🔌 **PLUGIN SYSTEM COMMANDS** (Phase 2)

### **Custom Actions**
```moringa
recognizer "send email"
    plugin_action "email_sender" to="[email]" subject="Hello"
    
recognizer "weather in [city]"
    plugin_action "weather_api" location="[city]"
```
- **`plugin_action`** - Execute custom plugin actions ✅ **WORKING**
- **Plugin Registration** - Custom command registration ✅ **WORKING**

---

## ⏰ **TIMING COMMANDS**

### **Delays & Scheduling**
```moringa
recognizer "wait please"
    say "Please wait..."
    wait 3s
    say "Thanks for waiting!"
```
- **`wait`** - Pause execution ✅ **WORKING**

---

## 🔍 **DEBUGGING & DEVELOPMENT**

### **Debug Output**
```moringa
recognizer "debug info"
    debug "Current user: [user_name]"
    debug "Memory state: [memory_dump]"
```
- **`debug`** - Development debug output ✅ **WORKING**

---

## 📊 **COMMAND STATUS SUMMARY**

### **✅ Fully Functional (25+ Commands)**
- **Core**: `recognizer`, `say`, `remember`, `forget`, `recall`, `ask`
- **Context**: `context`, `enter_context`, `exit_context`
- **Logic**: `condition`, `otherwise`, `option`, `option if`
- **Variables**: Full type system with transformations and scoping
- **State Machine**: `state`, `transition`, `onEnter`, `onExit`, `timeout`
- **Utilities**: `synonyms`, `conjugateAnd`, `conjugateTo`, `end`, `restart`
- **Plugins**: Custom action system
- **Debug**: `debug`, `wait`

### **🟡 Partially Implemented**
- **`sequence`** - Sequential action groups (basic implementation)
- **`escalate`** - Escalation handling (framework exists)

### **🔴 Planned/Not Implemented**
- **`schedule`** - Advanced scheduling (framework ready)
- **`repeat`** - Loop constructs (not yet implemented)
- **`validate`** - Advanced input validation (basic version exists)

---

## 🎯 **Usage Confidence**

**✅ Production Ready Commands (90%+):**
All core, advanced, and Phase 3 commands are fully functional and battle-tested.

**✅ Recent Testing Status:**
- ✅ Variable substitution system working
- ✅ Context isolation working  
- ✅ Memory operations working
- ✅ Advanced conditionals working
- ✅ State machines working
- ✅ Plugin system working
- ✅ Pattern priorities working

**✅ Phase 4 Integration:**
All commands work seamlessly in the visual Development Studio.

**✅ Phase 5 AI Enhancement:**
AI can generate patterns using any of these commands.

---

## 💡 **Quick Reference Examples**

### **Simple Bot**
```moringa
recognizer "hello" priority=10
    say "Hi there!"

recognizer "my name is [name]" priority=8
    remember "user name is [name|title_case]" type="string" scope="session"
    say "Nice to meet you, [name|title_case]!"

recognizer "what's my name" priority=7
    say "Your name is [user_name]"
```

### **Advanced Bot with Context & States**
```moringa
context "main_menu"
recognizer "help" context="main_menu"
    enter_context "help_system"
    transition "help_state"

state "help_state"
    onEnter
        say "What do you need help with?"
        say "Type 'back' to return to main menu"

recognizer "back" context="help_system"
    exit_context
    transition "main_state"
    say "Back to main menu"
```

---

**🎯 Bottom Line: ~25 commands are fully functional, with the core conversation capabilities, advanced logic, state machines, and AI integration all working in production.**