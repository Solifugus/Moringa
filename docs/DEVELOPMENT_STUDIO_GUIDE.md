# 🚀 Moringa Development Studio

**Visual development environment for advanced conversational AI**

The Moringa Development Studio is a modern, web-based IDE that provides a complete development environment for creating, testing, and deploying sophisticated chatbots using the Moringa platform.

---

## 🎯 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Start Development Studio**
```bash
npm run dev
# or
npm start
```

### **3. Open in Browser**
Navigate to: **http://localhost:3000**

### **4. Create Your First Script**
1. Click **"➕ New Script"** in the sidebar
2. Choose **"Basic Chatbot"** template  
3. Edit the script in the visual editor
4. Click **"▶ Test"** to launch chat interface
5. Save your script with **Ctrl+S**

---

## 🖥️ **Studio Interface**

### **Header Bar**
- **Project Info**: Current project name and connection status
- **Settings**: Theme, auto-save, debug options  
- **Save Project**: Quick save all changes

### **Left Sidebar**
- **📁 Project**: Create and import scripts
- **📜 Scripts**: List of all MoringaScripts in project
- **🤖 Test Agents**: Active chat agents for testing
- **🔧 Tools**: Validator, state machine, performance monitor

### **Main Content Area**
- **Tab System**: Multiple scripts and tools open simultaneously
- **Script Editor**: Syntax-highlighted MoringaScript editor with live validation
- **Chat Interface**: Real-time conversation testing with your bots
- **Tool Windows**: Validator, state machine designer, performance analytics

### **Right Panel** *(optional)*
- **Debug Information**: Variable states, pattern matches, performance metrics
- **Context Details**: Current conversation state and memory

---

## 📝 **Script Development**

### **Creating Scripts**
1. **New Script**: Click "➕ New Script" button
2. **Choose Template**:
   - **Blank Script**: Start from scratch
   - **Basic Chatbot**: Simple conversational patterns
   - **Customer Service**: Support workflow templates
   - **Survey Bot**: Data collection patterns

3. **Script Editor Features**:
   - **Syntax highlighting** for MoringaScript
   - **Live validation** with error detection
   - **Auto-completion** for commands
   - **Statistics**: Line count, recognizers, variables
   - **Auto-save** (configurable)

### **Advanced Features**

#### **Pattern Priorities**
```javascript
recognizer "urgent help" priority=10
    say "I'll connect you to priority support immediately!"

recognizer "help" priority=5
    say "How can I help you today?"
```

#### **Variable Types & Validation**
```javascript
recognizer "my email is [email]" priority=8
    remember "user email is [email|lowercase]" type="email" scope="session"
    say "Email [email] saved successfully!"

recognizer "I'm [age] years old" priority=7
    remember "user age is [age]" type="integer" constraints="min=0,max=150"
    say "Thanks! You're [age] years old."
```

#### **Advanced Conditionals**
```javascript
recognizer "check eligibility"
    condition "age >= 18 AND email exists"
        say "You're eligible for our service!"
    condition "age < 18"
        say "Sorry, you must be 18 or older."
    otherwise
        say "Please provide your age and email first."
```

---

## 💬 **Testing & Chat Interface**

### **Creating Test Agents**
1. **From Script**: Click "▶ Test" button next to any script
2. **Automatic**: Agents created when testing scripts
3. **Multiple Agents**: Test different script versions simultaneously

### **Chat Features**
- **Real-time messaging**: Instant responses from your bot
- **Message history**: Full conversation log
- **Debug mode**: See pattern matches, variables, performance
- **Export chat**: Save conversations for analysis
- **Multiple conversations**: Chat with different agents simultaneously

### **Testing Best Practices**
- **Test edge cases**: Try typos, unexpected inputs, empty messages
- **Verify variables**: Check that data is captured correctly
- **Test priorities**: Ensure higher priority patterns match first
- **Conversation flow**: Verify multi-step interactions work
- **Performance**: Monitor response times in debug panel

---

## ✓ **Script Validation**

### **Real-Time Validation**
- **Syntax errors**: Highlighted in editor immediately
- **Pattern conflicts**: Warning when patterns overlap
- **Variable usage**: Detect undefined or unused variables
- **Best practices**: Suggestions for optimization

### **Validation Tool**
Access via **"✓ Validator"** button:
- **Full script analysis**: Comprehensive error checking
- **Pattern optimization**: Suggestions for better performance  
- **Recognition statistics**: Pattern usage and effectiveness
- **Quality score**: Overall script quality rating

### **Common Issues**
- **Missing quotes**: Patterns must be quoted
- **Invalid variables**: Use [varName] syntax
- **Priority conflicts**: Higher numbers = higher priority
- **Syntax errors**: Check recognizer/say/remember syntax

---

## 🗂️ **State Machine Designer**

### **Visual Flow Design**
Access via **"🗂️ State Machine"** button:

1. **Add States**: Define conversation states (greeting, main_menu, billing, etc.)
2. **Create Transitions**: Connect states with triggers and conditions
3. **Set Guards**: Conditional logic for transitions
4. **Visual Preview**: See your conversation flow as a diagram

### **State Machine Example**
```javascript
// Customer Service Flow
State: greeting
  - onEnter: "Welcome! How can I help?"
  - timeout: 30s → timeout_state
  - transitions:
    → billing (trigger: "billing")
    → support (trigger: "technical")
    → human (trigger: "agent")

State: billing  
  - onEnter: "Billing department. What's your issue?"
  - transitions:
    → payment (trigger: "payment")
    → invoice (trigger: "invoice") 
    → main_menu (trigger: "back")
```

### **Advanced Features**
- **State data storage**: Persist information within states
- **Transition guards**: Conditional logic (age > 18, premium member, etc.)
- **Timeout handling**: Automatic transitions after inactivity
- **Event listeners**: React to state changes
- **Export/import**: Save state machine configurations

---

## ⚡ **Performance Monitoring**

### **Real-Time Analytics**
- **Response times**: Pattern matching performance
- **Memory usage**: Variable and state storage
- **Pattern statistics**: Most/least used patterns
- **Error rates**: Failed pattern matches
- **User engagement**: Conversation length, completion rates

### **Optimization Tips**
- **Pattern order**: Put common patterns first
- **Cache warming**: Frequently used patterns load faster
- **Variable cleanup**: Remove unused variables
- **State efficiency**: Minimize state transitions
- **Memory management**: Use appropriate scopes

---

## 🔧 **Development Tools**

### **Keyboard Shortcuts**
- **Ctrl+S**: Save current script
- **Ctrl+N**: New script
- **Ctrl+T**: Test current script
- **Ctrl+Shift+V**: Validate script
- **Ctrl+/**: Toggle comment
- **Escape**: Close modals/panels

### **Auto-Save**
- **Configurable**: Enable/disable in settings
- **Smart timing**: Saves 2 seconds after last edit
- **Conflict resolution**: Handles concurrent edits
- **Version tracking**: Automatic version incrementing

### **Export/Import**
- **Script export**: Save scripts as files
- **Project export**: Complete project backup
- **Template sharing**: Export templates for reuse
- **Configuration backup**: Save studio settings

### **Debug Panel**
- **Variable inspector**: Current variable values and scopes
- **Pattern trace**: See which patterns are tested
- **Performance metrics**: Response times and bottlenecks
- **Memory usage**: Variable and state memory consumption
- **Error logs**: Complete error history

---

## 🌐 **Deployment Options**

### **Docker Deployment**
```bash
# Build image
docker build -t moringa-studio .

# Run container
docker run -p 3000:3000 moringa-studio

# Or use Docker Compose
docker-compose up -d
```

### **Production Setup**
```bash
# Environment variables
export NODE_ENV=production
export PORT=3000

# Start production server
npm start
```

### **Cloud Deployment**
- **Containerized**: Works with Docker, Kubernetes, cloud platforms
- **Stateless**: No database required, session data in memory
- **Scalable**: Horizontal scaling with load balancer
- **Secure**: HTTPS, authentication, input validation

### **Integration Options**
- **REST API**: Programmatic access to all features
- **Webhooks**: Real-time notifications
- **Slack/Discord**: Direct bot deployment
- **Web embedding**: Chat widgets for websites
- **Voice assistants**: Alexa, Google Assistant bridges

---

## ⚙️ **Configuration**

### **Studio Settings**
- **Theme**: Dark/Light mode
- **Auto-save**: Enable/disable automatic saving
- **Debug level**: Error, Warning, Info, Debug
- **Editor preferences**: Font size, tab size, line numbers

### **Environment Configuration**
```javascript
// config/studio.json
{
  "server": {
    "port": 3000,
    "cors": true,
    "maxFileSize": "10mb"
  },
  "features": {
    "patternPriorities": true,
    "variableValidation": true,
    "stateMachines": true,
    "realTimeChat": true
  },
  "limits": {
    "maxScriptsPerSession": 50,
    "maxAgentsPerSession": 10,
    "sessionTimeoutMinutes": 1440
  }
}
```

### **Security Settings**
- **CORS configuration**: Control cross-origin requests
- **File upload limits**: Prevent large file attacks
- **Session management**: Secure session handling
- **Input validation**: Sanitize user input

---

## 🚀 **Advanced Use Cases**

### **Multi-Bot Development**
- **Bot families**: Develop related bots in one project
- **Shared resources**: Common patterns, variables, memory
- **A/B testing**: Compare different bot versions
- **Progressive enhancement**: Start simple, add complexity

### **Team Collaboration**
- **Import/Export**: Share scripts and templates
- **Version control**: Manual version tracking
- **Template library**: Reusable conversation patterns
- **Documentation**: Built-in commenting and notes

### **Enterprise Integration**
- **API integration**: Connect to CRM, support systems
- **Custom actions**: Extended functionality via plugins
- **Analytics integration**: Connect to business intelligence
- **Compliance**: Audit trails and conversation logging

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Connection Problems**
- Check if server is running on port 3000
- Verify no firewall blocking
- Check browser console for errors

#### **Script Validation Errors**
- Check syntax highlighting in editor
- Use validator tool for detailed analysis
- Review pattern syntax documentation

#### **Chat Not Responding**
- Verify script is saved and agent created
- Check pattern priorities and conflicts
- Use debug panel to trace pattern matching

#### **Performance Issues**
- Check pattern complexity and order
- Monitor memory usage in debug panel
- Optimize variable scopes and cleanup

### **Debug Information**
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Verify API calls
- **Debug Panel**: Monitor bot behavior
- **Server Logs**: Check server-side errors

---

## 📚 **Learning Resources**

### **Getting Started**
1. **Quick Start Tutorial**: 15-minute introduction
2. **Basic Bot Building**: Step-by-step guide
3. **Pattern Writing**: Best practices
4. **Testing Strategies**: Effective bot testing

### **Advanced Topics**
1. **State Machine Design**: Complex conversation flows
2. **Variable Management**: Types, scoping, validation
3. **Performance Optimization**: Speed and efficiency
4. **Plugin Development**: Extending functionality

### **Example Projects**
- **Customer Support Bot**: Multi-department routing
- **Survey Collection Bot**: Data gathering workflows  
- **E-commerce Assistant**: Shopping and checkout flows
- **Educational Tutor**: Adaptive learning conversations

---

## 🎉 **What's New in Phase 4**

### **Visual Development Environment**
- **Complete web-based IDE** for Moringa development
- **Real-time collaboration** and testing
- **Professional development experience**

### **Advanced Features**
- **Pattern priority system** with visual indicators
- **Type-safe variable management** with validation
- **Complex conditional logic** with visual debugger
- **State machine designer** with flow visualization

### **Production Ready**
- **Docker containerization** for easy deployment
- **Minimal dependencies** (just Express + vanilla frontend)
- **Enterprise security** and performance
- **Cloud platform ready**

---

**🚀 The Moringa Development Studio transforms chatbot development from coding to visual design, making sophisticated conversational AI accessible to developers and non-developers alike!**

*For API documentation, see `/docs/API_REFERENCE.md`*  
*For deployment guides, see `/docs/DEPLOYMENT_GUIDE.md`*