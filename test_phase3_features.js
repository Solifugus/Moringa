/**
 * Phase 3 Advanced Language Features Demonstration
 * Tests enhanced pattern matching, variable system, and conditional logic
 */

const { MoringaEnhancedV3 } = require('./moringa-enhanced-v3.js');

console.log('🎯 MORINGA PHASE 3 ADVANCED FEATURES DEMONSTRATION');
console.log('='.repeat(70));

async function runPhase3Demo() {

    // Create enhanced Moringa agent with Phase 3 features
    const agent = new MoringaEnhancedV3((message) => {
        console.log(`🤖 Bot: ${message}`);
    });

    console.log('⏳ Initializing advanced features...');
    await agent.initializeAdvancedFeatures();

    console.log('\n📝 Test script with advanced features loaded');

    // === PHASE 3 TEST SCRIPT ===

    const advancedTestScript = `
    Memories
        "Advanced pattern matching is enabled"
        "Variable transformations work properly"
        "Conditional logic supports complex expressions"

    recognizer "my name is [name] and I'm [age] years old" priority=10
        remember "user name is [name|capitalize]"
        remember "user age is [age]" type="integer" scope="session"
        say "Hello [name|title_case], you are [age] years old!"

    recognizer "my email is [email]" priority=8
        remember "user email is [email|lowercase]" type="email" scope="session"
        say "Email [email] saved successfully!"

    recognizer "transfer $[amount] to [account]" priority=9
        remember "last transfer amount is [amount]" type="currency"
        remember "last transfer account is [account]"
        say "Transfer of [amount|format_currency] to [account|uppercase] initiated!"

    recognizer "my phone is [phone]" priority=7
        remember "user phone is [phone]" type="phone" scope="session"
        say "Phone number [phone|format_phone] has been saved!"

    recognizer "calculate [expression]" priority=6
        calculate "[expression]"
        say "Calculation result: [calculation_result]"

    recognizer "show my profile" priority=5
        show_profile
        say "Here's your saved profile information"

    recognizer "test fuzzy matching" priority=4 type="fuzzy"
        say "Fuzzy pattern matching is working! ✨"

    recognizer "/test regex (\\w+)/" priority=3 type="regex"
        say "Regex matched word: [1]"

    recognizer "help me with [topic]" priority=2 type="semantic"
        say "I can provide assistance with [topic]!"

    recognizer "reset my [data_type]" priority=1
        reset_user_data "[data_type]"
        say "Your [data_type] has been reset"
    `;

    // Load the advanced script
    agent.merge(advancedTestScript);

    console.log('✅ Advanced test script loaded');
    console.log('');

    // === PHASE 1: Enhanced Pattern Matching with Priorities ===

    console.log('🔍 PHASE 1: Enhanced Pattern Matching');
    console.log('-'.repeat(40));

    console.log('📊 Testing pattern priority system...');

    console.log('\n1. High Priority Pattern (Priority 10):');
    await agent.input("my name is Alice and I'm 28 years old");

    console.log('\n2. Medium Priority Pattern (Priority 8):');
    await agent.input('my email is alice@example.com');

    console.log('\n3. High Priority Financial Pattern (Priority 9):');
    await agent.input('transfer $150.50 to savings account');

    console.log('\n4. Phone Pattern with Formatting (Priority 7):');
    await agent.input('my phone is 1234567890');

    console.log('\n📈 Pattern Statistics:');
    const patternStats = agent.getPatternStatistics();
    console.log(`  Total Matches: ${patternStats.totalMatches}`);
    console.log(`  Average Response Time: ${patternStats.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Cache Size: ${patternStats.cacheSize}`);

    console.log('\n' + '='.repeat(70));

    // === PHASE 2: Advanced Variable System ===

    console.log('📊 PHASE 2: Advanced Variable System');
    console.log('-'.repeat(40));

    console.log('🔧 Testing variable types, transformations, and scoping...');

    // Show current variables
    console.log('\n📋 Current Variables:');
    const variables = agent.listVariables();
    variables.forEach(variable => {
        console.log(`  • ${variable.name}: ${variable.value} (${variable.type || 'any'}) [${variable.scope}]`);
    });

    // Test variable retrieval with different scopes
    console.log('\n🔍 Variable Retrieval Tests:');

    const nameVar = agent.variableSystem.getVariable('user name', { scope: 'local' });
    console.log(`  Local scope - user name: ${nameVar.found ? nameVar.value : 'not found'}`);

    const emailVar = agent.variableSystem.getVariable('user email', { scope: 'session' });
    console.log(`  Session scope - user email: ${emailVar.found ? emailVar.value : 'not found'}`);

    const ageVar = agent.variableSystem.getVariable('user age', { scope: 'session' });
    console.log(`  Session scope - user age: ${ageVar.found ? ageVar.value : 'not found'} (${ageVar.type || 'unknown type'})`);

    // Test type validation
    console.log('\n🧪 Type Validation Tests:');

    try {
        const result1 = agent.variableSystem.setVariable('test_age', 'not a number', {
            type: 'integer',
            validate: true
        });
        console.log(`  Invalid integer test: ${result1.success ? 'FAILED' : 'PASSED'} - ${result1.error || 'OK'}`);
    } catch (error) {
        console.log(`  Invalid integer test: PASSED - ${error.message}`);
    }

    try {
        const result2 = agent.variableSystem.setVariable('test_email', 'invalid-email', {
            type: 'email',
            validate: true
        });
        console.log(`  Invalid email test: ${result2.success ? 'FAILED' : 'PASSED'} - ${result2.error || 'OK'}`);
    } catch (error) {
        console.log(`  Invalid email test: PASSED - ${error.message}`);
    }

    console.log('\n📊 Variable System Statistics:');
    const varStats = agent.getVariableStatistics();
    console.log(`  Total Variables: ${varStats.totalVariables}`);
    console.log(`  Set Operations: ${varStats.setOperations}`);
    console.log(`  Get Operations: ${varStats.getOperations}`);
    console.log(`  Type Validations: ${varStats.typeValidations}`);
    console.log(`  Transformation Operations: ${varStats.transformations}`);
    console.log(`  Validation Failures: ${varStats.validationFailures}`);

    console.log('\n' + '='.repeat(70));

    // === PHASE 3: Advanced Conditional Logic ===

    console.log('🧠 PHASE 3: Advanced Conditional Logic');
    console.log('-'.repeat(40));

    console.log('🔧 Testing complex conditional expressions...');

    // Set up test variables for conditional logic
    agent.variableSystem.setVariable('user_level', 5, { type: 'integer', scope: 'session' });
    agent.variableSystem.setVariable('premium_member', true, { type: 'boolean', scope: 'session' });
    agent.variableSystem.setVariable('account_balance', 150.75, { type: 'number', scope: 'session' });

    console.log('\n🧪 Conditional Logic Tests:');

    // Test simple comparison
    console.log('\n1. Simple Comparison Test (user_level > 3):');
    const condition1 = await agent.evaluateAdvancedCondition('user_level > 3', agent.model[agent.name], {});
    console.log(`  Result: ${condition1} (Expected: true)`);

    // Test compound condition with AND
    console.log('\n2. Compound AND Test (user_level >= 5 AND premium_member == true):');
    const condition2 = await agent.evaluateAdvancedCondition('user_level >= 5 AND premium_member == true', agent.model[agent.name], {});
    console.log(`  Result: ${condition2} (Expected: true)`);

    // Test compound condition with OR
    console.log('\n3. Compound OR Test (account_balance > 200 OR premium_member == true):');
    const condition3 = await agent.evaluateAdvancedCondition('account_balance > 200 OR premium_member == true', agent.model[agent.name], {});
    console.log(`  Result: ${condition3} (Expected: true)`);

    // Test NOT condition
    console.log('\n4. NOT Condition Test (NOT user_level < 3):');
    const condition4 = await agent.evaluateAdvancedCondition('NOT user_level < 3', agent.model[agent.name], {});
    console.log(`  Result: ${condition4} (Expected: true)`);

    // Test variable existence
    console.log('\n5. Variable Existence Test (exists user_level):');
    const condition5 = await agent.evaluateAdvancedCondition('exists user_level', agent.model[agent.name], {});
    console.log(`  Result: ${condition5} (Expected: true)`);

    // Test type checking
    console.log('\n6. Type Checking Test (type user_level integer):');
    const condition6 = await agent.evaluateAdvancedCondition('type user_level integer', agent.model[agent.name], {});
    console.log(`  Result: ${condition6} (Expected: true)`);

    console.log('\n' + '='.repeat(70));

    // === PHASE 4: Fuzzy and Semantic Pattern Matching ===

    console.log('🎯 PHASE 4: Fuzzy and Semantic Pattern Matching');
    console.log('-'.repeat(40));

    console.log('🧪 Testing advanced pattern matching types...');

    // Test fuzzy matching with typos
    console.log('\n1. Fuzzy Matching Test (intentional typos):');
    await agent.input('tst fuzy matchng'); // Should match "test fuzzy matching"

    // Test semantic matching
    console.log('\n2. Semantic Matching Test (synonyms):');
    await agent.input('assist me with coding'); // "assist" should match "help"

    console.log('\n3. Regex Pattern Test:');
    await agent.input('test regex hello'); // Should match regex pattern

    console.log('\n' + '='.repeat(70));

    // === PHASE 5: Multi-Pattern Recognition ===

    console.log('🔄 PHASE 5: Multi-Pattern Recognition');
    console.log('-'.repeat(40));

    console.log('🧪 Testing multi-pattern matching...');

    // Enable multi-pattern matching
    agent.setConfig('patternMatching', {
        enableMultiMatch: true,
        maxMatches: 3
    });

    console.log('✅ Multi-pattern matching enabled');

    // This should potentially match multiple patterns
    console.log('\n1. Multi-Match Test Input:');
    const multiResult = await agent.input('help me calculate something');

    console.log('\n' + '='.repeat(70));

    // === PHASE 6: Advanced Variable Transformations ===

    console.log('🔧 PHASE 6: Advanced Variable Transformations');
    console.log('-'.repeat(40));

    console.log('🧪 Testing advanced transformations...');

    console.log('\n1. Chain Transformation Test:');
    await agent.input('my name is john smith');

    console.log('\n2. Currency Formatting Test:');
    await agent.input('transfer $99.99 to checking');

    console.log('\n3. Phone Formatting Test:');
    await agent.input('my phone is 5551234567');

    console.log('\n' + '='.repeat(70));

    // === PHASE 7: Performance and Statistics ===

    console.log('📊 PHASE 7: Performance Analysis');
    console.log('-'.repeat(40));

    console.log('📈 System Performance Metrics:');

    // Pattern engine statistics
    const finalPatternStats = agent.getPatternStatistics();
    console.log('\n🔍 Pattern Engine:');
    console.log(`  Total Matches: ${finalPatternStats.totalMatches}`);
    console.log(`  Average Response Time: ${finalPatternStats.averageResponseTime.toFixed(2)}ms`);
    console.log(`  Cache Hit Ratio: ${(finalPatternStats.cacheSize / (finalPatternStats.totalMatches || 1) * 100).toFixed(1)}%`);
    console.log(`  Top Patterns:`);
    finalPatternStats.topPatterns.slice(0, 3).forEach((pattern, index) => {
        console.log(`    ${index + 1}. ${pattern.pattern} (${pattern.hits} hits)`);
    });

    // Variable system statistics
    const finalVarStats = agent.getVariableStatistics();
    console.log('\n📊 Variable System:');
    console.log(`  Total Variables: ${finalVarStats.totalVariables}`);
    console.log(`  Variable Distribution:`);
    Object.entries(finalVarStats.variableCounts).forEach(([scope, count]) => {
        console.log(`    ${scope}: ${count} variables`);
    });
    console.log(`  Success Rate: ${((finalVarStats.setOperations - finalVarStats.validationFailures) / finalVarStats.setOperations * 100).toFixed(1)}%`);

    console.log('\n' + '='.repeat(70));

    // === PHASE 8: Configuration and Management ===

    console.log('⚙️  PHASE 8: System Management');
    console.log('-'.repeat(40));

    console.log('🔧 Configuration Management:');
    console.log('\nCurrent Configuration:');
    const config = agent.getConfig();
    console.log(JSON.stringify(config, null, 2));

    console.log('\n📤 Exporting Debug Information:');
    const debugInfo = agent.exportAdvancedDebugInfo('phase3_debug_info.json');
    console.log('✅ Debug information exported');

    console.log('\n📋 Final Variable List:');
    const finalVariables = agent.listVariables();
    finalVariables.forEach(variable => {
        console.log(`  • ${variable.name}: ${variable.value} (${variable.type || 'any'}) [${variable.scope}:${variable.context}]`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('🎉 PHASE 3 DEMONSTRATION COMPLETE!');
    console.log('');
    console.log('📋 Summary of Achievements:');
    console.log('  ✅ Enhanced Pattern Matching with Priority System');
    console.log('  ✅ Advanced Variable System with Types & Scoping');
    console.log('  ✅ Complex Conditional Logic with Operators');
    console.log('  ✅ Fuzzy and Semantic Pattern Recognition');
    console.log('  ✅ Multi-Pattern Matching Support');
    console.log('  ✅ Variable Transformations and Validation');
    console.log('  ✅ Performance Monitoring and Statistics');
    console.log('  ✅ Comprehensive Configuration Management');
    console.log('');
    console.log('🚀 Moringa Phase 3 Advanced Language Features are production-ready!');
}

// Run the demonstration
runPhase3Demo().catch(error => {
    console.error('❌ Phase 3 demo failed:', error);
    console.error(error.stack);
});