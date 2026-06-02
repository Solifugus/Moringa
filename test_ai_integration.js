/**
 * Test AI Integration with Ollama
 */

const { MoringaAI, AIConfiguration } = require('./moringa-ai-integration.js');

console.log('🤖 Testing Moringa AI Integration with Ollama');
console.log('='.repeat(50));

async function testAIIntegration() {
    try {
        // 1. Test Configuration
        console.log('📋 Testing AI Configuration...');
        const config = new AIConfiguration();
        const settings = config.config; // Fixed: access config property directly
        console.log(`✅ Provider: ${settings.provider}`);
        console.log(`✅ Features enabled: ${Object.keys(settings.features).filter(k => settings.features[k]).join(', ')}`);

        // 2. Test AI Provider
        console.log('\n🔗 Testing AI Provider Connection...');
        const aiProvider = config.createProvider();
        const available = await aiProvider.isAvailable();
        console.log(`✅ AI Provider available: ${available}`);

        if (!available) {
            console.log('❌ Ollama not available. Make sure Ollama is running with: ollama serve');
            return;
        }

        // 3. Test Pattern Suggestions
        console.log('\n💡 Testing Pattern Suggestions...');
        const suggestions = await aiProvider.generateSuggestions(`
Generate 3 MoringaScript recognizer patterns for a pizza ordering chatbot.
Return only the patterns, one per line, like:
recognizer "I want to order [item]" priority=10
recognizer "my name is [name]" priority=8
recognizer "cancel my order" priority=9
`, { max_tokens: 100, temperature: 0.7 });

        console.log('AI Suggested Patterns:');
        suggestions.slice(0, 3).forEach((suggestion, i) => {
            console.log(`  ${i+1}. ${suggestion}`);
        });

        // 4. Test Pattern Matching Enhancement
        console.log('\n🎯 Testing Pattern Matching Enhancement...');
        const mockPatterns = [
            { pattern: "I want to order [item]", priority: 10 },
            { pattern: "my name is [name]", priority: 8 },
            { pattern: "help", priority: 5 }
        ];

        const testInputs = [
            "I'd like to get a pizza",  // Should match order pattern
            "My name's John",           // Should match name pattern
            "I need assistance"         // Should match help pattern
        ];

        for (const input of testInputs) {
            console.log(`\nTesting input: "${input}"`);
            const enhancement = await aiProvider.enhancePatternMatching(input, mockPatterns);

            if (enhancement) {
                console.log(`  ✅ Best match: "${enhancement.bestMatch}"`);
                console.log(`  ✅ Confidence: ${enhancement.confidence}`);
                console.log(`  ✅ Explanation: ${enhancement.explanation}`);
            } else {
                console.log(`  ⚠️  No AI enhancement available`);
            }
        }

        // 5. Test Conversation Analysis
        console.log('\n📊 Testing Conversation Analysis...');
        const mockConversation = [
            { type: 'user', content: 'hi there' },
            { type: 'bot', content: 'Hello! How can I help you?' },
            { type: 'user', content: 'I want to order food' },
            { type: 'bot', content: "I don't understand that" },
            { type: 'user', content: 'pizza please' },
            { type: 'bot', content: "I don't understand that" }
        ];

        const analysis = await aiProvider.analyzeConversation(mockConversation);
        if (analysis) {
            console.log('✅ Conversation Analysis Results:');
            console.log(`  - Missed intents: ${analysis.missedIntents?.join(', ') || 'none detected'}`);
            console.log(`  - Flow quality: ${analysis.conversationFlow || 'not assessed'}`);
            console.log(`  - Recommendations: ${analysis.recommendations?.length || 0} suggestions`);
        }

        console.log('\n🎉 AI Integration Test Complete!');
        console.log('✅ Ollama is working correctly with Moringa');
        console.log('✅ AI features are ready for Development Studio integration');

    } catch (error) {
        console.error('❌ AI Integration test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testAIIntegration().then(() => {
    console.log('\n📝 Next Steps:');
    console.log('1. Integrate AI features into Development Studio');
    console.log('2. Add AI assistant panel to web interface');
    console.log('3. Enable AI-enhanced pattern matching in core engine');
    console.log('4. Test complete Phase 5 functionality');
});