/**
 * Moringa Development Studio - Web Server
 * Visual development environment for Moringa chatbots
 * Dependencies: express (web server), fs (built-in)
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

// Import Moringa systems
const { MoringaEnhancedV3 } = require('./moringa-enhanced-v3.js');
const { MoringaStateMachine } = require('./moringa-state-machine.js');
const { MoringaAI } = require('./moringa-ai-integration.js');

class MoringaDevServer {
    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.agents = new Map(); // Active agent instances
        this.sessions = new Map(); // User sessions
        this.ai = null; // AI integration (initialized in start())

        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocketAlternative();
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // Parse JSON requests
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Serve static files from dev-studio directory
        this.app.use('/static', express.static(path.join(__dirname, 'dev-studio')));

        // CORS for development
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });

        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // === MAIN DEVELOPMENT STUDIO PAGE ===
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'dev-studio', 'index.html'));
        });

        // === SESSION MANAGEMENT ===
        this.app.post('/api/session/create', (req, res) => {
            const sessionId = this.generateSessionId();
            const session = {
                id: sessionId,
                created: new Date(),
                lastActivity: new Date(),
                scripts: {},
                settings: {
                    theme: 'dark',
                    autoSave: true,
                    debugLevel: 'info'
                }
            };

            this.sessions.set(sessionId, session);

            res.json({
                success: true,
                sessionId: sessionId,
                session: session
            });
        });

        this.app.get('/api/session/:sessionId', (req, res) => {
            const session = this.sessions.get(req.params.sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            session.lastActivity = new Date();
            res.json({ success: true, session });
        });

        // === SCRIPT MANAGEMENT ===
        this.app.post('/api/script/create', (req, res) => {
            try {
                const { sessionId, name, content = '', type = 'moringa' } = req.body;
                const session = this.sessions.get(sessionId);

                if (!session) {
                    return res.status(404).json({ error: 'Session not found' });
                }

                const script = {
                    id: this.generateId(),
                    name: name,
                    content: content,
                    type: type,
                    created: new Date(),
                    modified: new Date(),
                    version: 1
                };

                session.scripts[script.id] = script;

                res.json({
                    success: true,
                    script: script
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.put('/api/script/:scriptId', (req, res) => {
            try {
                const { sessionId, content, name } = req.body;
                const session = this.sessions.get(sessionId);

                if (!session) {
                    return res.status(404).json({ error: 'Session not found' });
                }

                const script = session.scripts[req.params.scriptId];
                if (!script) {
                    return res.status(404).json({ error: 'Script not found' });
                }

                script.content = content || script.content;
                script.name = name || script.name;
                script.modified = new Date();
                script.version += 1;

                res.json({
                    success: true,
                    script: script
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/script/:scriptId', (req, res) => {
            const { sessionId } = req.query;
            const session = this.sessions.get(sessionId);

            if (!session) {
                return res.status(404).json({ error: 'Session not found' });
            }

            const script = session.scripts[req.params.scriptId];
            if (!script) {
                return res.status(404).json({ error: 'Script not found' });
            }

            res.json({
                success: true,
                script: script
            });
        });

        // === AGENT MANAGEMENT ===
        this.app.post('/api/agent/create', async (req, res) => {
            try {
                const { sessionId, scriptId, name = 'TestBot' } = req.body;
                const session = this.sessions.get(sessionId);

                if (!session) {
                    return res.status(404).json({ error: 'Session not found' });
                }

                const script = session.scripts[scriptId];
                if (!script) {
                    return res.status(404).json({ error: 'Script not found' });
                }

                const agentId = this.generateId();
                const messages = [];

                // Create agent with message capture
                const agent = new MoringaEnhancedV3((message) => {
                    messages.push({
                        timestamp: Date.now(),
                        type: 'bot',
                        content: message
                    });
                }, name);

                // Initialize advanced features
                await agent.initializeAdvancedFeatures();

                // Load the script
                if (script.content) {
                    agent.merge(script.content);
                }

                this.agents.set(agentId, {
                    id: agentId,
                    agent: agent,
                    messages: messages,
                    sessionId: sessionId,
                    scriptId: scriptId,
                    created: Date.now(),
                    name: name
                });

                res.json({
                    success: true,
                    agentId: agentId,
                    status: 'created'
                });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/agent/:agentId/input', async (req, res) => {
            try {
                const { message, userName = 'User' } = req.body;
                const agentData = this.agents.get(req.params.agentId);

                if (!agentData) {
                    return res.status(404).json({ error: 'Agent not found' });
                }

                // Add user message to history
                agentData.messages.push({
                    timestamp: Date.now(),
                    type: 'user',
                    content: message,
                    userName: userName
                });

                // Process input through agent
                const result = await agentData.agent.input(message, userName);

                res.json({
                    success: true,
                    result: result,
                    messages: agentData.messages.slice(-10), // Last 10 messages
                    statistics: {
                        patterns: agentData.agent.getPatternStatistics(),
                        variables: agentData.agent.getVariableStatistics()
                    }
                });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/agent/:agentId/messages', (req, res) => {
            const agentData = this.agents.get(req.params.agentId);

            if (!agentData) {
                return res.status(404).json({ error: 'Agent not found' });
            }

            const limit = parseInt(req.query.limit) || 50;
            const messages = agentData.messages.slice(-limit);

            res.json({
                success: true,
                messages: messages,
                total: agentData.messages.length
            });
        });

        // === VALIDATION AND TESTING ===
        this.app.post('/api/script/validate', (req, res) => {
            try {
                const { content } = req.body;

                // Create temporary agent to test script
                const testMessages = [];
                const testAgent = new MoringaEnhancedV3((msg) => testMessages.push(msg));

                // Try to parse the script
                testAgent.merge(content);

                // Get recognizer information
                const model = testAgent.model[testAgent.name];
                const recognizers = model.recognizers.map(r => ({
                    pattern: r.pattern,
                    priority: r.priority || 0,
                    context: r.context || 'default',
                    actions: r.actions ? r.actions.length : 0
                }));

                res.json({
                    success: true,
                    valid: true,
                    recognizers: recognizers,
                    recognizerCount: recognizers.length
                });

            } catch (error) {
                res.json({
                    success: false,
                    valid: false,
                    error: error.message
                });
            }
        });

        // === STATE MACHINE VISUALIZATION ===
        this.app.post('/api/statemachine/create', (req, res) => {
            try {
                const { name, description } = req.body;
                const stateMachine = new MoringaStateMachine();

                const smId = this.generateId();

                // Store state machine (in memory for now)
                if (!this.stateMachines) {
                    this.stateMachines = new Map();
                }

                this.stateMachines.set(smId, {
                    id: smId,
                    name: name || 'Untitled State Machine',
                    description: description || '',
                    stateMachine: stateMachine,
                    created: Date.now()
                });

                res.json({
                    success: true,
                    stateMachineId: smId
                });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/statemachine/:smId/export', (req, res) => {
            try {
                if (!this.stateMachines) {
                    return res.status(404).json({ error: 'No state machines found' });
                }

                const smData = this.stateMachines.get(req.params.smId);
                if (!smData) {
                    return res.status(404).json({ error: 'State machine not found' });
                }

                const exported = smData.stateMachine.export();

                res.json({
                    success: true,
                    export: exported,
                    metadata: {
                        id: smData.id,
                        name: smData.name,
                        description: smData.description,
                        created: smData.created
                    }
                });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // === SYSTEM INFORMATION ===
        this.app.get('/api/system/info', (req, res) => {
            res.json({
                success: true,
                version: '3.0.0',
                phase: 4,
                features: {
                    patternEngine: true,
                    variableSystem: true,
                    stateMachine: true,
                    pluginSystem: true,
                    advancedConditionals: true
                },
                statistics: {
                    activeSessions: this.sessions.size,
                    activeAgents: this.agents.size,
                    uptime: process.uptime()
                }
            });
        });

        // === FILE OPERATIONS ===
        this.app.post('/api/file/save', (req, res) => {
            try {
                const { filename, content, type = 'script' } = req.body;

                if (!filename) {
                    return res.status(400).json({ error: 'Filename required' });
                }

                // Sanitize filename
                const safeFilename = filename.replace(/[^a-z0-9.-]/gi, '_');
                const filePath = path.join(__dirname, 'user-scripts', safeFilename);

                // Ensure directory exists
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                fs.writeFileSync(filePath, content);

                res.json({
                    success: true,
                    filepath: filePath,
                    filename: safeFilename
                });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.get('/api/file/list', (req, res) => {
            try {
                const scriptsDir = path.join(__dirname, 'user-scripts');

                if (!fs.existsSync(scriptsDir)) {
                    return res.json({
                        success: true,
                        files: []
                    });
                }

                const files = fs.readdirSync(scriptsDir).map(filename => {
                    const filePath = path.join(scriptsDir, filename);
                    const stats = fs.statSync(filePath);

                    return {
                        filename: filename,
                        size: stats.size,
                        modified: stats.mtime,
                        created: stats.birthtime
                    };
                });

                res.json({
                    success: true,
                    files: files
                });

            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // === AI INTEGRATION ===
        this.app.get('/api/ai/status', async (req, res) => {
            try {
                if (!this.ai) {
                    return res.json({
                        enabled: false,
                        provider: 'none',
                        available: false
                    });
                }

                const available = await this.ai.aiProvider.isAvailable();
                const config = this.ai.getConfiguration();

                res.json({
                    enabled: this.ai.isAIEnabled(),
                    provider: config.provider,
                    available: available,
                    features: config.features
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ai/suggestions', async (req, res) => {
            try {
                const { userGoal, existingPatterns = [] } = req.body;

                if (!this.ai || !this.ai.isAIEnabled()) {
                    return res.json({
                        success: false,
                        message: 'AI features not available',
                        suggestions: []
                    });
                }

                const suggestions = await this.ai.suggestPatterns(userGoal, existingPatterns);

                res.json({
                    success: true,
                    suggestions: suggestions,
                    userGoal: userGoal
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ai/analyze-script', async (req, res) => {
            try {
                const { content } = req.body;

                if (!this.ai || !this.ai.isAIEnabled()) {
                    return res.json({
                        success: false,
                        message: 'AI features not available',
                        analysis: null
                    });
                }

                const analysis = await this.ai.analyzeScript(content);

                res.json({
                    success: true,
                    analysis: analysis
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ai/analyze-conversation', async (req, res) => {
            try {
                const { messages } = req.body;

                if (!this.ai || !this.ai.isAIEnabled()) {
                    return res.json({
                        success: false,
                        message: 'AI features not available',
                        analysis: null
                    });
                }

                const analysis = await this.ai.analyzeConversation(messages);

                res.json({
                    success: true,
                    analysis: analysis
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        this.app.post('/api/ai/config', async (req, res) => {
            try {
                const { config } = req.body;

                if (!this.ai) {
                    return res.status(400).json({ error: 'AI not initialized' });
                }

                const success = await this.ai.updateConfiguration(config);

                res.json({
                    success: success,
                    config: this.ai.getConfiguration()
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // === ERROR HANDLING ===
        this.app.use((err, req, res, next) => {
            console.error('Server error:', err);
            res.status(500).json({
                error: 'Internal server error',
                message: err.message
            });
        });
    }

    /**
     * Setup WebSocket alternative using Server-Sent Events
     */
    setupWebSocketAlternative() {
        this.app.get('/api/events/:sessionId', (req, res) => {
            // Setup Server-Sent Events for real-time updates
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            const sessionId = req.params.sessionId;

            // Send initial connection message
            res.write('data: {"type":"connected","sessionId":"' + sessionId + '"}\n\n');

            // Keep connection alive with heartbeat
            const heartbeat = setInterval(() => {
                res.write('data: {"type":"heartbeat","timestamp":' + Date.now() + '}\n\n');
            }, 30000);

            // Cleanup on client disconnect
            req.on('close', () => {
                clearInterval(heartbeat);
            });
        });
    }

    /**
     * Generate unique IDs
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generateSessionId() {
        return 'session_' + this.generateId();
    }

    /**
     * Start the server
     */
    async start() {
        // Initialize AI Integration
        try {
            console.log('🤖 Initializing AI Integration...');
            const dummyEngine = { findMatches: () => [] }; // Placeholder for now
            this.ai = await new MoringaAI(dummyEngine).initialize();

            if (this.ai.isAIEnabled()) {
                console.log(`✅ AI Integration active with ${this.ai.getConfiguration().provider}`);
            } else {
                console.log('⚠️ AI Integration disabled - running in rules-only mode');
            }
        } catch (error) {
            console.warn('⚠️ AI Integration failed, continuing without AI:', error.message);
            this.ai = null;
        }

        // Cleanup old sessions periodically
        setInterval(() => {
            this.cleanupSessions();
        }, 300000); // 5 minutes

        this.app.listen(this.port, () => {
            console.log('🚀 Moringa Development Studio Started!');
            console.log('='.repeat(50));
            console.log(`🌐 Server running at: http://localhost:${this.port}`);
            console.log(`📊 Development Studio: http://localhost:${this.port}`);
            console.log(`🔧 API Base: http://localhost:${this.port}/api`);
            console.log('='.repeat(50));
            console.log('📋 Available Endpoints:');
            console.log('  • GET  /                    - Development Studio');
            console.log('  • POST /api/session/create  - Create session');
            console.log('  • POST /api/script/create   - Create script');
            console.log('  • POST /api/agent/create    - Create agent');
            console.log('  • POST /api/script/validate - Validate script');
            console.log('  • GET  /api/system/info     - System info');
            console.log('='.repeat(50));
        });
    }

    /**
     * Cleanup old sessions and agents
     */
    cleanupSessions() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastActivity.getTime() > maxAge) {
                this.sessions.delete(sessionId);

                // Cleanup associated agents
                for (const [agentId, agentData] of this.agents.entries()) {
                    if (agentData.sessionId === sessionId) {
                        this.agents.delete(agentId);
                    }
                }

                console.log(`🧹 Cleaned up old session: ${sessionId}`);
            }
        }
    }
}

// Export for external use
module.exports = { MoringaDevServer };

// Start server if run directly
if (require.main === module) {
    const server = new MoringaDevServer(3000);
    server.start();
}