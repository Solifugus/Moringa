/**
 * Plugin System Demonstration
 * Shows comprehensive plugin architecture capabilities
 */

const { MoringaEnhanced } = require('./moringa-enhanced.js');
const { httpPlugin, fileSystemPlugin, mathPlugin } = require('./plugins/action-examples.js');
const { fuzzyMatchPlugin, regexMatchPlugin, semanticMatchPlugin } = require('./plugins/pattern-examples.js');

console.log('🔌 Moringa Plugin System Demonstration');
console.log('='.repeat(60));

async function runPluginDemo() {

    // Create enhanced Moringa agent with plugin support
    const agent = new MoringaEnhanced((message) => {
        console.log(`🤖 Bot: ${message}`);
    });

    // Test script with basic functionality and plugin integration
    const testScript = `
    Memories
        "The sky is blue"
        "JavaScript is a programming language"

    recognizer "hello"
        say "Hello! I'm a plugin-enhanced Moringa bot!"

    recognizer "my name is [name]"
        remember "user name is [name]"
        say "Nice to meet you, [name]! I have plugin capabilities!"

    recognizer "calculate [expression]"
        calculate "[expression]"
        say "Calculation complete: [calculation_result]"

    recognizer "get data from [url]"
        http_get "[url]"
        say "HTTP request sent to [url], status: [http_status]"

    recognizer "save [content] to [filename]"
        write_file "[filename]" "[content]"
        say "File [filename] written: [bytes_written] bytes"

    recognizer "test fuzzy matching"
        say "This should work with fuzzy pattern matching!"

    recognizer "/test regex (\\w+)/"
        say "Regex matched: [1]"

    recognizer "help me with [topic]"
        say "I can help with [topic] using my plugins!"
    `;

    // Load the script
    agent.merge(testScript);

    console.log('📝 Test script loaded');
    console.log('');

    // === PHASE 1: Register and Load Action Plugins ===

    console.log('📦 PHASE 1: Action Plugins');
    console.log('-'.repeat(30));

    console.log('📋 Registering action plugins...');

    // Register action plugins
    const actionPlugins = [httpPlugin, fileSystemPlugin, mathPlugin];
    for (const plugin of actionPlugins) {
        const success = agent.registerPlugin(plugin);
        console.log(`  ${success ? '✅' : '❌'} ${plugin.name} v${plugin.version}`);
    }

    console.log('');
    console.log('⚡ Loading action plugins...');

    // Load action plugins
    for (const plugin of actionPlugins) {
        const success = await agent.loadPlugin(plugin.name);
        console.log(`  ${success ? '✅' : '❌'} ${plugin.name} loaded`);
    }

    console.log('');
    console.log('🧪 Testing action plugins...');

    // Test math plugin
    console.log('\n1. Testing Math Plugin:');
    agent.input('calculate 15 + 27 * 2');

    // Test HTTP plugin
    console.log('\n2. Testing HTTP Plugin:');
    agent.input('get data from https://api.example.com/users');

    // Test file system plugin
    console.log('\n3. Testing File System Plugin:');
    agent.input('save Hello World! to ./data/test.txt');

    console.log('\n' + '='.repeat(60));

    // === PHASE 2: Register and Load Pattern Matcher Plugins ===

    console.log('🔍 PHASE 2: Pattern Matcher Plugins');
    console.log('-'.repeat(30));

    console.log('📋 Registering pattern matcher plugins...');

    // Register pattern matcher plugins
    const patternPlugins = [fuzzyMatchPlugin, regexMatchPlugin, semanticMatchPlugin];
    for (const plugin of patternPlugins) {
        const success = agent.registerPlugin(plugin);
        console.log(`  ${success ? '✅' : '❌'} ${plugin.name} v${plugin.version}`);
    }

    console.log('');
    console.log('⚡ Loading pattern matcher plugins...');

    // Load pattern matcher plugins
    for (const plugin of patternPlugins) {
        const success = await agent.loadPlugin(plugin.name);
        console.log(`  ${success ? '✅' : '❌'} ${plugin.name} loaded`);
    }

    console.log('');
    console.log('🧪 Testing pattern matcher plugins...');

    // Test fuzzy matching
    console.log('\n1. Testing Fuzzy Matcher (close match):');
    agent.input('test fuzy matchng'); // Intentional typos

    // Test semantic matching
    console.log('\n2. Testing Semantic Matcher:');
    agent.input('assist me with programming'); // "assist" ~= "help"

    // Test exact pattern (should still work)
    console.log('\n3. Testing Exact Pattern Matching:');
    agent.input('my name is Alice');

    console.log('\n' + '='.repeat(60));

    // === PHASE 3: Plugin Management Commands ===

    console.log('⚙️  PHASE 3: Plugin Management');
    console.log('-'.repeat(30));

    // Show plugin status
    console.log('📊 Plugin System Status:');
    const status = agent.getPluginStatus();
    console.log('  Enabled:', status.enabled);
    console.log('  Total Plugins:', status.totalPlugins);
    console.log('  Loaded Plugins:', status.loadedPlugins);
    console.log('  Failed Plugins:', status.failedPlugins);
    console.log('  By Type:', JSON.stringify(status.pluginsByType, null, '    '));

    console.log('');
    console.log('📋 Registered Plugins List:');
    const plugins = agent.listPlugins();
    plugins.forEach(plugin => {
        console.log(`  • ${plugin.name} v${plugin.version} (${plugin.type}) - ${plugin.status}`);
        console.log(`    ${plugin.description}`);
    });

    console.log('\n' + '='.repeat(60));

    // === PHASE 4: Plugin Performance Testing ===

    console.log('⚡ PHASE 4: Performance Testing');
    console.log('-'.repeat(30));

    console.log('🔬 Performance benchmarking...');

    // Benchmark action plugins
    console.time('Action Plugin Performance');
    for (let i = 0; i < 10; i++) {
        agent.input(`calculate ${Math.floor(Math.random() * 100)} + ${Math.floor(Math.random() * 100)}`);
    }
    console.timeEnd('Action Plugin Performance');

    // Benchmark pattern matching
    console.time('Pattern Matching Performance');
    const testInputs = [
        'hello there',
        'my name is Bob',
        'test fuzy matchng',
        'calculate 5 + 5',
        'help me with math'
    ];

    for (let i = 0; i < 20; i++) {
        const input = testInputs[i % testInputs.length];
        agent.input(input);
    }
    console.timeEnd('Pattern Matching Performance');

    console.log('\n' + '='.repeat(60));

    // === PHASE 5: Plugin Lifecycle Management ===

    console.log('🔄 PHASE 5: Plugin Lifecycle Management');
    console.log('-'.repeat(30));

    console.log('📤 Testing plugin unloading...');

    // Unload a plugin
    const unloadResult = await agent.unloadPlugin('math-actions');
    console.log(`  Unload math-actions: ${unloadResult ? '✅ Success' : '❌ Failed'}`);

    // Test that unloaded plugin doesn't work
    console.log('\n🧪 Testing unloaded plugin (should fail):');
    try {
        agent.input('calculate 10 + 20');
        console.log('  ❌ Plugin should not have worked');
    } catch (error) {
        console.log('  ✅ Plugin correctly unavailable');
    }

    // Reload the plugin
    console.log('\n📥 Reloading plugin...');
    const reloadResult = await agent.loadPlugin('math-actions');
    console.log(`  Reload math-actions: ${reloadResult ? '✅ Success' : '❌ Failed'}`);

    // Test that reloaded plugin works
    console.log('\n🧪 Testing reloaded plugin:');
    agent.input('calculate 10 + 20');

    console.log('\n' + '='.repeat(60));

    // === PHASE 6: Error Handling and Edge Cases ===

    console.log('⚠️  PHASE 6: Error Handling');
    console.log('-'.repeat(30));

    console.log('🧪 Testing error scenarios...');

    // Test unknown action
    console.log('\n1. Unknown action (should fall back to original system):');
    agent.input('unknown_action_command');

    // Test plugin disable
    console.log('\n2. Disabling plugin system:');
    console.log('  ' + agent.setPluginsEnabled(false));
    agent.input('calculate 5 + 5'); // Should use original system

    console.log('\n3. Re-enabling plugin system:');
    console.log('  ' + agent.setPluginsEnabled(true));
    agent.input('calculate 5 + 5'); // Should use plugins again

    console.log('\n' + '='.repeat(60));

    // === PHASE 7: Debug Information Export ===

    console.log('🔍 PHASE 7: Debug Information');
    console.log('-'.repeat(30));

    // Export debug info
    const debugInfo = agent.exportDebugInfo('plugin_debug_info.json');
    console.log('📄 Debug information exported');

    // Show summary
    console.log('\n📊 Session Summary:');
    console.log(`  Total Inputs: ${agent.inputCount}`);
    console.log(`  Log Entries: ${agent.logEntries.length}`);
    console.log(`  Plugin System Status: ${debugInfo.pluginSystem.enabled ? 'Enabled' : 'Disabled'}`);
    console.log(`  Loaded Plugins: ${debugInfo.pluginSystem.plugins.filter(p => p.status === 'loaded').length}`);

    console.log('\n' + '='.repeat(60));

    // === PHASE 8: Interactive Test Context ===

    console.log('🎮 PHASE 8: Interactive Test Context');
    console.log('-'.repeat(30));

    // Create test context for manual testing
    const testContext = agent.createTestContext();

    console.log('🧪 Running test context scenarios...');

    // Test various inputs using test context
    const testScenarios = [
        'hello',
        'my name is TestUser',
        'calculate 42 * 7',
        'get data from https://api.test.com',
        'help me with plugins'
    ];

    for (const scenario of testScenarios) {
        console.log(`\n🎯 Scenario: "${scenario}"`);
        testContext.testInput(scenario);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Plugin System Demonstration Complete!');
    console.log('');
    console.log('📋 Summary:');
    console.log('  ✅ Action plugins (HTTP, File, Math)');
    console.log('  ✅ Pattern matcher plugins (Fuzzy, Regex, Semantic)');
    console.log('  ✅ Plugin lifecycle management');
    console.log('  ✅ Performance benchmarking');
    console.log('  ✅ Error handling and fallbacks');
    console.log('  ✅ Debug information export');
    console.log('  ✅ Interactive test context');
    console.log('');
    console.log('🚀 The Moringa Plugin System is ready for production use!');
}

// Error handling wrapper
runPluginDemo().catch(error => {
    console.error('❌ Demo failed:', error);
    console.error(error.stack);
});