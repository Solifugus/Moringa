/**
 * Moringa AI Integration - Phase 5
 * Hybrid AI/Rule-based conversational AI capabilities
 *
 * This module provides optional AI enhancement while maintaining deterministic core
 */

const http = require('http');

/**
 * AI Provider Interface
 * Standardized interface for different AI providers (Ollama, OpenAI, etc.)
 */
class AIProvider {
    constructor(config) {
        this.config = config;
        this.enabled = config.enabled || false;
        this.type = config.type || 'none';
    }

    async isAvailable() {
        return this.enabled;
    }

    async generateSuggestions(prompt, options = {}) {
        throw new Error('generateSuggestions must be implemented by subclass');
    }

    async enhancePatternMatching(input, patterns, options = {}) {
        throw new Error('enhancePatternMatching must be implemented by subclass');
    }

    async analyzeConversation(messages, options = {}) {
        throw new Error('analyzeConversation must be implemented by subclass');
    }
}

/**
 * Ollama Local AI Provider
 * Integrates with local Ollama service for privacy and cost control
 */
class OllamaProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.endpoint = config.endpoint || 'http://localhost:11434';
        this.model = config.model || 'llama3.2:1b';
    }

    async isAvailable() {
        if (!this.enabled) return false;

        try {
            // Test if Ollama is running
            const response = await this.makeRequest('/api/tags', 'GET');
            return response && Array.isArray(response.models);
        } catch (error) {
            console.log('Ollama not available:', error.message);
            return false;
        }
    }

    async generateSuggestions(prompt, options = {}) {
        if (!await this.isAvailable()) return [];

        try {
            const response = await this.makeRequest('/api/generate', 'POST', {
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    max_tokens: options.max_tokens || 200
                }
            });

            return this.parseSuggestions(response.response);
        } catch (error) {
            console.error('AI suggestion failed:', error.message);
            return [];
        }
    }

    async enhancePatternMatching(input, patterns, options = {}) {
        if (!await this.isAvailable()) return null;

        const prompt = `
User input: "${input}"
Available patterns: ${patterns.map(p => `"${p.pattern}"`).join(', ')}

Analyze the user input and determine:
1. Which pattern is the best match (if any)
2. Confidence score (0-1)
3. Explanation of why

Respond in JSON format:
{
    "bestMatch": "pattern text or null",
    "confidence": 0.85,
    "explanation": "why this pattern matches",
    "suggestedPattern": "new pattern if no good match"
}`;

        try {
            const response = await this.generateSuggestions(prompt, {
                temperature: 0.3, // Lower temperature for more consistent analysis
                max_tokens: 150
            });

            // Try to extract JSON from the response
            const jsonMatch = response[0]?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        } catch (error) {
            console.error('Pattern matching enhancement failed:', error.message);
            return null;
        }
    }

    async analyzeConversation(messages, options = {}) {
        if (!await this.isAvailable()) return null;

        const conversationText = messages.map(m =>
            `${m.type === 'user' ? 'User' : 'Bot'}: ${m.content}`
        ).join('\n');

        const prompt = `
Analyze this conversation and provide insights:
${conversationText}

Provide analysis in JSON format:
{
    "missedIntents": ["intents the bot didn't understand"],
    "suggestedPatterns": ["new patterns to add"],
    "conversationFlow": "smooth/awkward/broken",
    "recommendations": ["specific improvements"]
}`;

        try {
            const response = await this.generateSuggestions(prompt, {
                temperature: 0.4,
                max_tokens: 300
            });

            const jsonMatch = response[0]?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        } catch (error) {
            console.error('Conversation analysis failed:', error.message);
            return null;
        }
    }

    async makeRequest(path, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const url = new URL(this.endpoint + path);
            const options = {
                hostname: url.hostname,
                port: url.port || 11434,
                path: url.pathname,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(options, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        resolve(parsed);
                    } catch (e) {
                        resolve({ response: responseData });
                    }
                });
            });

            req.on('error', reject);

            if (data && method !== 'GET') {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    parseSuggestions(response) {
        // Try to extract suggestions from AI response
        try {
            // Handle null or undefined response
            if (!response) return [];

            // Convert to string if not already
            const responseStr = typeof response === 'string' ? response : JSON.stringify(response);

            // Look for JSON array
            const jsonMatch = responseStr.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            // Look for line-separated suggestions
            const lines = responseStr.split('\n')
                .filter(line => line && line.trim() && line.length > 0)
                .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
                .filter(line => line.length > 0)
                .slice(0, 5); // Max 5 suggestions

            return lines.length > 0 ? lines : [responseStr.substring(0, 100)];
        } catch (e) {
            console.warn('Failed to parse AI suggestions:', e.message);
            return response ? [String(response).substring(0, 100)] : [];
        }
    }
}

/**
 * OpenAI Provider (for reference - users provide their own API key)
 */
class OpenAIProvider extends AIProvider {
    constructor(config) {
        super(config);
        this.apiKey = config.apiKey;
        this.model = config.model || 'gpt-4';
        this.endpoint = 'https://api.openai.com/v1/chat/completions';
    }

    async isAvailable() {
        return this.enabled && this.apiKey;
    }

    // Implementation would use fetch/http to call OpenAI API
    // Left as template for users who want to use OpenAI instead of Ollama
}

/**
 * AI-Enhanced Pattern Engine
 * Extends the core pattern engine with optional AI capabilities
 */
class AIEnhancedPatternEngine {
    constructor(coreEngine, aiProvider = null) {
        this.coreEngine = coreEngine;
        this.aiProvider = aiProvider;
        this.enableAI = aiProvider && aiProvider.enabled;
        this.fallbackToRules = true; // Always fallback to deterministic
    }

    async findMatches(input, patterns, options = {}) {
        // 1. ALWAYS try core deterministic pattern matching first
        const exactMatches = await this.coreEngine.findMatches(input, patterns);

        if (exactMatches && exactMatches.length > 0) {
            // Deterministic match found - use it (preserves Moringa's core strength)
            return exactMatches.map(match => ({
                ...match,
                matchType: 'deterministic',
                confidence: 1.0
            }));
        }

        // 2. If no exact match and AI is enabled, try AI enhancement
        if (this.enableAI && this.aiProvider) {
            try {
                const aiAnalysis = await this.aiProvider.enhancePatternMatching(input, patterns, {
                    threshold: options.aiThreshold || 0.7
                });

                if (aiAnalysis && aiAnalysis.confidence > (options.aiThreshold || 0.7)) {
                    // Find the actual pattern object
                    const matchedPattern = patterns.find(p =>
                        p.pattern === aiAnalysis.bestMatch
                    );

                    if (matchedPattern) {
                        return [{
                            pattern: matchedPattern,
                            matchType: 'ai-enhanced',
                            confidence: aiAnalysis.confidence,
                            explanation: aiAnalysis.explanation,
                            originalInput: input
                        }];
                    }
                }

                // Log missed intent for future pattern suggestions
                if (options.logMissedIntents && aiAnalysis?.suggestedPattern) {
                    this.logMissedIntent(input, aiAnalysis.suggestedPattern);
                }
            } catch (error) {
                console.warn('AI enhancement failed, falling back to rules:', error.message);
            }
        }

        // 3. Fallback: no matches found
        return [];
    }

    logMissedIntent(input, suggestedPattern) {
        // Store missed intents for analysis and pattern improvement
        if (!this.missedIntents) this.missedIntents = [];

        this.missedIntents.push({
            timestamp: new Date().toISOString(),
            userInput: input,
            suggestedPattern: suggestedPattern
        });

        // Keep only recent missed intents (last 100)
        if (this.missedIntents.length > 100) {
            this.missedIntents = this.missedIntents.slice(-100);
        }
    }

    getMissedIntents() {
        return this.missedIntents || [];
    }
}

/**
 * AI Development Assistant
 * Provides AI-powered suggestions for script development
 */
class AIDevelopmentAssistant {
    constructor(aiProvider) {
        this.aiProvider = aiProvider;
    }

    async suggestPatternsForGoal(userGoal, existingPatterns = []) {
        if (!this.aiProvider || !await this.aiProvider.isAvailable()) {
            return [];
        }

        const prompt = `
User wants to create a chatbot for: "${userGoal}"

Existing patterns: ${existingPatterns.map(p => `"${p}"`).join(', ')}

Generate 3-5 MoringaScript recognizer patterns that would handle this goal.
Each pattern should be practical and specific.
Format as a JSON array of objects with 'pattern' and 'description' fields.

Example:
[
    {
        "pattern": "I want to order [item]",
        "description": "Handles product ordering requests"
    }
]`;

        try {
            const suggestions = await this.aiProvider.generateSuggestions(prompt, {
                temperature: 0.7,
                max_tokens: 300
            });

            return this.parsePatternSuggestions(suggestions[0]);
        } catch (error) {
            console.error('Pattern suggestion failed:', error.message);
            return [];
        }
    }

    async analyzeScript(scriptContent) {
        if (!this.aiProvider || !await this.aiProvider.isAvailable()) {
            return null;
        }

        const prompt = `
Analyze this MoringaScript and suggest improvements:

${scriptContent}

Provide analysis in JSON format:
{
    "qualityScore": 8.5,
    "strengths": ["what works well"],
    "improvements": ["specific suggestions"],
    "potentialIssues": ["possible problems"],
    "optimizations": ["performance improvements"]
}`;

        try {
            const response = await this.aiProvider.generateSuggestions(prompt, {
                temperature: 0.3,
                max_tokens: 400
            });

            const jsonMatch = response[0]?.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return null;
        } catch (error) {
            console.error('Script analysis failed:', error.message);
            return null;
        }
    }

    parsePatternSuggestions(response) {
        try {
            // Try to extract JSON array
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return Array.isArray(parsed) ? parsed : [];
            }

            // Fallback: parse line-by-line
            const lines = response.split('\n')
                .filter(line => line.trim() && line.includes('"'))
                .map(line => {
                    const match = line.match(/"([^"]+)"/);
                    return match ? {
                        pattern: match[1],
                        description: 'AI-suggested pattern'
                    } : null;
                })
                .filter(Boolean);

            return lines.slice(0, 5);
        } catch (e) {
            console.warn('Failed to parse AI pattern suggestions:', e.message);
            return [];
        }
    }
}

/**
 * AI Configuration Manager
 */
class AIConfiguration {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const fs = require('fs');
            const configPath = './config/ai-config.json';

            if (fs.existsSync(configPath)) {
                return JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
        } catch (error) {
            console.log('Loading default AI configuration');
        }

        return this.getDefaultConfig();
    }

    getDefaultConfig() {
        return {
            enabled: true,
            provider: 'ollama',
            providers: {
                ollama: {
                    enabled: true,
                    endpoint: 'http://localhost:11434',
                    model: 'llama3.2:1b'
                },
                openai: {
                    enabled: false,
                    apiKey: '',
                    model: 'gpt-4'
                },
                none: {
                    enabled: false
                }
            },
            features: {
                patternSuggestions: true,
                scriptAnalysis: true,
                conversationAnalytics: true,
                enhancedMatching: true
            },
            thresholds: {
                aiConfidence: 0.7,
                suggestionLimit: 5
            }
        };
    }

    saveConfig(config) {
        try {
            const fs = require('fs');
            const path = require('path');

            const configDir = './config';
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }

            fs.writeFileSync('./config/ai-config.json', JSON.stringify(config, null, 2));
            this.config = config;
            return true;
        } catch (error) {
            console.error('Failed to save AI configuration:', error.message);
            return false;
        }
    }

    createProvider() {
        const providerConfig = this.config.providers[this.config.provider];

        switch (this.config.provider) {
            case 'ollama':
                return new OllamaProvider(providerConfig);
            case 'openai':
                return new OpenAIProvider(providerConfig);
            default:
                return new AIProvider({ enabled: false });
        }
    }
}

/**
 * Main AI Integration Manager
 * Coordinates all AI features while maintaining deterministic core
 */
class MoringaAI {
    constructor(coreEngine, config = {}) {
        this.coreEngine = coreEngine;
        this.configuration = new AIConfiguration();
        this.aiProvider = this.configuration.createProvider();
        this.enhancedEngine = new AIEnhancedPatternEngine(coreEngine, this.aiProvider);
        this.assistant = new AIDevelopmentAssistant(this.aiProvider);

        // Initialize features based on configuration
        this.features = this.configuration.config.features;
    }

    async initialize() {
        if (this.aiProvider && this.aiProvider.enabled) {
            const available = await this.aiProvider.isAvailable();
            if (!available) {
                console.warn('AI provider not available, running in rules-only mode');
                this.aiProvider.enabled = false;
            } else {
                console.log(`AI integration initialized with ${this.configuration.config.provider}`);
            }
        }
        return this;
    }

    // Main interface for enhanced pattern matching
    async findMatches(input, patterns, options = {}) {
        if (this.features.enhancedMatching) {
            return await this.enhancedEngine.findMatches(input, patterns, options);
        }
        return await this.coreEngine.findMatches(input, patterns);
    }

    // Development assistance
    async suggestPatterns(userGoal, existingPatterns = []) {
        if (this.features.patternSuggestions) {
            return await this.assistant.suggestPatternsForGoal(userGoal, existingPatterns);
        }
        return [];
    }

    async analyzeScript(scriptContent) {
        if (this.features.scriptAnalysis) {
            return await this.assistant.analyzeScript(scriptContent);
        }
        return null;
    }

    async analyzeConversation(messages) {
        if (this.features.conversationAnalytics) {
            return await this.aiProvider.analyzeConversation(messages);
        }
        return null;
    }

    // Status and configuration
    isAIEnabled() {
        return this.aiProvider && this.aiProvider.enabled;
    }

    getConfiguration() {
        return this.configuration.config;
    }

    async updateConfiguration(newConfig) {
        const success = this.configuration.saveConfig(newConfig);
        if (success) {
            this.aiProvider = this.configuration.createProvider();
            this.enhancedEngine = new AIEnhancedPatternEngine(this.coreEngine, this.aiProvider);
            this.assistant = new AIDevelopmentAssistant(this.aiProvider);
            await this.initialize();
        }
        return success;
    }
}

module.exports = {
    MoringaAI,
    AIProvider,
    OllamaProvider,
    OpenAIProvider,
    AIEnhancedPatternEngine,
    AIDevelopmentAssistant,
    AIConfiguration
};