# Moringa Plugin System Guide

The Moringa Plugin System provides a powerful, extensible architecture for adding custom functionality to your conversational AI without modifying the core engine. This guide covers everything from basic usage to advanced plugin development.

## Table of Contents

- [Quick Start](#quick-start)
- [Plugin Types](#plugin-types)
- [Creating Plugins](#creating-plugins)
- [Plugin Management](#plugin-management)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [API Reference](#api-reference)

## Quick Start

### Basic Usage

```javascript
const { MoringaEnhanced } = require('./moringa-enhanced.js');
const { mathPlugin } = require('./plugins/action-examples.js');

// Create enhanced agent with plugin support
const agent = new MoringaEnhanced(message => console.log(message));

// Register and load a plugin
agent.registerPlugin(mathPlugin);
await agent.loadPlugin('math-actions');

// Use plugin functionality in MoringaScript
const script = `
recognizer "calculate [expression]"
    do "calculate [expression]"
    say "Result: [calculation_result]"
`;

agent.merge(script);
agent.input('calculate 15 + 27'); // Uses math plugin
```

### MoringaScript Integration

Plugins seamlessly integrate with MoringaScript:

```javascript
// Action plugins add new commands
recognizer "save data"
    do "write_file ./data.txt Hello World"
    say "File saved!"

// Pattern plugins enhance matching
recognizer "hlelo"  // Fuzzy matcher handles typos
    say "Hello there!"

// Multiple plugins work together
recognizer "fetch and calculate"
    do "http_get https://api.example.com/number"
    do "calculate [http_data] * 2"
    say "Doubled result: [calculation_result]"
```

## Plugin Types

The plugin system supports four main types:

### 1. Action Plugins

Add custom action commands that can be used with the `do` command:

```javascript
const actionPlugin = {
    name: 'my-actions',
    version: '1.0.0',
    type: 'action',
    description: 'Custom action commands',
    
    exports: {
        actions: {
            async my_action(args, context, instance) {
                // Action implementation
                return 'Action completed';
            }
        }
    }
};
```

**Use in MoringaScript:**
```
recognizer "trigger my action"
    do "my_action param1 param2"
    say "Done!"
```

### 2. Pattern Matcher Plugins

Enhance pattern recognition with custom matching algorithms:

```javascript
const patternPlugin = {
    name: 'my-matcher',
    version: '1.0.0',
    type: 'pattern',
    description: 'Custom pattern matching',
    
    exports: {
        async matcher(input, patterns, context, instance) {
            // Return match result or null
            return {
                pattern: matchedPattern,
                score: confidenceScore,
                variables: extractedVariables
            };
        }
    }
};
```

### 3. Memory Store Plugins

Provide alternative memory storage backends:

```javascript
const memoryPlugin = {
    name: 'database-memory',
    version: '1.0.0',
    type: 'memory',
    description: 'Database-backed memory storage',
    
    exports: {
        provider: {
            async store(key, value) { /* ... */ },
            async retrieve(key) { /* ... */ },
            async delete(key) { /* ... */ }
        }
    }
};
```

### 4. Integration Plugins

Connect with external services and APIs:

```javascript
const integrationPlugin = {
    name: 'slack-integration',
    version: '1.0.0',
    type: 'integration',
    description: 'Slack messaging integration',
    
    exports: {
        integration: {
            async send(channel, message) { /* ... */ },
            async listen(callback) { /* ... */ }
        }
    }
};
```

## Creating Plugins

### Plugin Structure

Every plugin must follow this structure:

```javascript
const myPlugin = {
    // Required fields
    name: 'unique-plugin-name',      // kebab-case identifier
    version: '1.0.0',               // Semantic versioning
    type: 'action',                 // Plugin type
    description: 'What this plugin does',
    
    // Optional configuration schema
    config: {
        timeout: 5000,
        retries: 3,
        apiKey: null
    },
    
    // Optional initialization function
    async initialize(config, context) {
        context.log('Plugin initializing...');
        return {
            // Plugin instance data
            config: config,
            client: new ApiClient(config.apiKey)
        };
    },
    
    // Optional cleanup function
    async destroy(instance) {
        if (instance.client) {
            await instance.client.close();
        }
    },
    
    // Plugin functionality
    exports: {
        // Type-specific exports
    }
};
```

### Action Plugin Development

Action plugins add new commands to MoringaScript:

```javascript
const weatherPlugin = {
    name: 'weather-actions',
    version: '1.0.0',
    type: 'action',
    description: 'Weather information actions',
    config: {
        apiKey: null,
        units: 'metric'
    },
    
    async initialize(config, context) {
        if (!config.apiKey) {
            throw new Error('Weather API key required');
        }
        
        return {
            config: config,
            requestCount: 0
        };
    },
    
    exports: {
        actions: {
            /**
             * Get weather for a location
             * Usage: do "weather_get London"
             */
            async weather_get(args, context, instance) {
                const location = args[0];
                if (!location) {
                    throw new Error('Location is required');
                }
                
                instance.requestCount++;
                
                // Simulate API call
                const weatherData = await fetchWeather(location, instance.config);
                
                // Set variables for use in bot responses
                context.setVariable('weather_location', location);
                context.setVariable('weather_temp', weatherData.temperature.toString());
                context.setVariable('weather_desc', weatherData.description);
                
                return `Weather for ${location}: ${weatherData.temperature}°C, ${weatherData.description}`;
            },
            
            /**
             * Get weather forecast
             * Usage: do "weather_forecast London 5"
             */
            async weather_forecast(args, context, instance) {
                const location = args[0];
                const days = parseInt(args[1]) || 1;
                
                if (!location) {
                    throw new Error('Location is required');
                }
                
                if (days < 1 || days > 7) {
                    throw new Error('Forecast days must be 1-7');
                }
                
                const forecast = await fetchForecast(location, days, instance.config);
                
                context.setVariable('forecast_location', location);
                context.setVariable('forecast_days', days.toString());
                context.setVariable('forecast_data', JSON.stringify(forecast));
                
                return `${days}-day forecast for ${location} retrieved`;
            }
        }
    }
};

async function fetchWeather(location, config) {
    // Weather API implementation
    return {
        temperature: 22,
        description: 'Sunny',
        humidity: 65
    };
}

async function fetchForecast(location, days, config) {
    // Forecast API implementation
    return Array.from({ length: days }, (_, i) => ({
        day: i + 1,
        temperature: 20 + Math.random() * 10,
        description: ['Sunny', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 3)]
    }));
}
```

**Usage in MoringaScript:**
```javascript
recognizer "what is the weather in [city]"
    do "weather_get [city]"
    say "The weather in [weather_location] is [weather_temp]°C and [weather_desc]"

recognizer "forecast for [city]"
    do "weather_forecast [city] 3"
    say "3-day forecast for [forecast_location] has been retrieved"
```

### Pattern Matcher Plugin Development

Pattern matcher plugins enhance recognition capabilities:

```javascript
const soundexPlugin = {
    name: 'soundex-matcher',
    version: '1.0.0',
    type: 'pattern',
    description: 'Phonetic pattern matching using Soundex algorithm',
    config: {
        threshold: 0.8,
        enabled: true
    },
    
    async initialize(config, context) {
        context.log('Soundex pattern matcher initializing...');
        return {
            config: config,
            matchCache: new Map()
        };
    },
    
    exports: {
        async matcher(input, patterns, context, instance) {
            if (!instance.config.enabled) return null;
            
            const inputSoundex = generateSoundex(input.toLowerCase());
            let bestMatch = null;
            let bestScore = 0;
            
            for (const pattern of patterns) {
                const patternText = pattern.text.toLowerCase();
                const patternSoundex = generateSoundex(patternText);
                
                // Calculate phonetic similarity
                const similarity = compareSoundex(inputSoundex, patternSoundex);
                
                if (similarity >= instance.config.threshold && similarity > bestScore) {
                    bestScore = similarity;
                    bestMatch = {
                        pattern: pattern,
                        score: similarity,
                        method: 'soundex',
                        confidence: similarity,
                        variables: extractVariablesFromPattern(input, pattern.text)
                    };
                }
            }
            
            return bestMatch;
        }
    }
};

function generateSoundex(text) {
    // Soundex algorithm implementation
    const cleaned = text.replace(/[^a-z]/g, '');
    if (!cleaned) return '';
    
    let soundex = cleaned[0].toUpperCase();
    const consonants = cleaned.slice(1).replace(/[aeiouyhw]/g, '');
    
    const mapping = {
        'bfpv': '1', 'cgjkqsxz': '2', 'dt': '3',
        'l': '4', 'mn': '5', 'r': '6'
    };
    
    for (const char of consonants) {
        for (const [chars, code] of Object.entries(mapping)) {
            if (chars.includes(char)) {
                soundex += code;
                break;
            }
        }
    }
    
    return soundex.padEnd(4, '0').slice(0, 4);
}

function compareSoundex(s1, s2) {
    if (s1 === s2) return 1.0;
    
    let matches = 0;
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
        if (s1[i] === s2[i]) matches++;
    }
    
    return matches / Math.max(s1.length, s2.length);
}

function extractVariablesFromPattern(input, pattern) {
    // Simple variable extraction - implement based on your needs
    const variables = {};
    const varMatches = pattern.match(/\[([^\]]+)\]/g);
    
    if (varMatches) {
        // In a real implementation, use proper parsing
        varMatches.forEach((match, index) => {
            const varName = match.slice(1, -1);
            variables[varName] = input; // Placeholder
        });
    }
    
    return variables;
}
```

## Plugin Management

### Registration and Loading

```javascript
const agent = new MoringaEnhanced();

// Register plugin
const success = agent.registerPlugin(myPlugin);
if (!success) {
    console.error('Plugin registration failed');
}

// Load plugin with custom config
await agent.loadPlugin('my-plugin', {
    apiKey: 'your-api-key',
    timeout: 10000
});

// Check if plugin is loaded
const plugins = agent.listPlugins();
const myPlugin = plugins.find(p => p.name === 'my-plugin');
console.log(`Plugin status: ${myPlugin.status}`);
```

### Plugin Lifecycle

```javascript
// Load plugin
await agent.loadPlugin('weather-actions', {
    apiKey: process.env.WEATHER_API_KEY
});

// Use plugin
agent.input('what is the weather in London');

// Unload plugin
await agent.unloadPlugin('weather-actions');

// Plugin is no longer available
agent.input('what is the weather in Paris'); // Falls back to original system
```

### Configuration Management

```javascript
// Plugin with configuration
const configuredPlugin = {
    name: 'api-client',
    config: {
        baseUrl: 'https://api.example.com',
        timeout: 5000,
        retries: 3,
        apiKey: null
    },
    // ...
};

// Load with custom configuration
await agent.loadPlugin('api-client', {
    baseUrl: 'https://api.myservice.com',
    apiKey: 'my-secret-key',
    timeout: 10000
});
```

## Advanced Features

### Plugin Hooks

The plugin system provides hooks for cross-cutting concerns:

```javascript
const loggingPlugin = {
    name: 'request-logger',
    version: '1.0.0',
    type: 'integration',
    description: 'Logs all inputs and actions',
    
    async initialize(config, context) {
        // Register hooks
        context.addHook('beforeInput', this.logInput.bind(this));
        context.addHook('afterAction', this.logAction.bind(this));
        
        return { logCount: 0 };
    },
    
    async logInput(data) {
        console.log(`📝 Input: "${data.message}" from ${data.name}`);
    },
    
    async logAction(data) {
        console.log(`⚡ Action: ${data.actionName} completed`);
    },
    
    exports: {
        integration: {
            // Integration-specific exports
        }
    }
};
```

### Plugin Communication

Plugins can communicate through the shared context:

```javascript
// Plugin A sets data
const pluginA = {
    exports: {
        actions: {
            async set_shared_data(args, context, instance) {
                context.setVariable('shared_value', args[0]);
                return 'Data set';
            }
        }
    }
};

// Plugin B reads data
const pluginB = {
    exports: {
        actions: {
            async get_shared_data(args, context, instance) {
                const value = context.getVariable('shared_value');
                return `Shared value: ${value}`;
            }
        }
    }
};
```

### Error Handling and Fallbacks

```javascript
const robustPlugin = {
    name: 'robust-actions',
    exports: {
        actions: {
            async risky_action(args, context, instance) {
                try {
                    // Potentially failing operation
                    const result = await riskyOperation();
                    return result;
                    
                } catch (error) {
                    context.log(`Action failed: ${error.message}`);
                    
                    // Graceful fallback
                    context.setVariable('error_occurred', 'true');
                    context.setVariable('error_message', error.message);
                    
                    return 'Operation failed, but handled gracefully';
                }
            }
        }
    }
};
```

### Performance Optimization

```javascript
const optimizedPlugin = {
    name: 'optimized-matcher',
    type: 'pattern',
    
    async initialize(config, context) {
        return {
            cache: new Map(),
            stats: { hits: 0, misses: 0 }
        };
    },
    
    exports: {
        async matcher(input, patterns, context, instance) {
            // Use caching for expensive operations
            const cacheKey = `${input}:${patterns.length}`;
            
            if (instance.cache.has(cacheKey)) {
                instance.stats.hits++;
                return instance.cache.get(cacheKey);
            }
            
            // Expensive matching operation
            const result = await expensiveMatch(input, patterns);
            
            instance.cache.set(cacheKey, result);
            instance.stats.misses++;
            
            return result;
        }
    }
};
```

## Best Practices

### Plugin Design

1. **Single Responsibility**: Each plugin should have one clear purpose
2. **Configuration**: Use config objects for customization
3. **Error Handling**: Always handle errors gracefully
4. **Documentation**: Include clear usage examples
5. **Versioning**: Use semantic versioning for compatibility

### Naming Conventions

```javascript
// Good plugin names
'weather-actions'      // Clear and descriptive
'fuzzy-matcher'        // Indicates functionality
'database-memory'      // Shows type and purpose

// Action naming
'weather_get'          // Verb_object pattern
'user_authenticate'    // Clear action purpose
'email_send'           // What it does

// Variable naming
'weather_temperature'  // Namespaced
'api_response_code'    // Descriptive
'user_login_status'    // Clear meaning
```

### Security Considerations

```javascript
const securePlugin = {
    name: 'secure-actions',
    config: {
        allowedPaths: ['./data/', './uploads/'],
        maxFileSize: 1024 * 1024,
        sanitizeInput: true
    },
    
    exports: {
        actions: {
            async secure_action(args, context, instance) {
                // Validate input
                const input = instance.config.sanitizeInput ? 
                    sanitizeInput(args[0]) : args[0];
                
                // Check permissions
                if (!isAllowedOperation(input, instance.config)) {
                    throw new Error('Operation not permitted');
                }
                
                // Perform action safely
                return await performSecureOperation(input);
            }
        }
    }
};
```

### Testing Plugins

```javascript
// Plugin testing
async function testPlugin() {
    const agent = new MoringaEnhanced();
    
    // Register and load plugin
    agent.registerPlugin(myPlugin);
    await agent.loadPlugin('my-plugin');
    
    // Test functionality
    const testContext = agent.createTestContext();
    
    try {
        const result = await testContext.testAction('my_action', ['param1']);
        console.log('✅ Plugin test passed:', result);
    } catch (error) {
        console.error('❌ Plugin test failed:', error);
    }
}
```

## Examples

### Complete Weather Plugin

```javascript
const weatherPlugin = {
    name: 'weather-service',
    version: '2.0.0',
    type: 'action',
    description: 'Comprehensive weather information service',
    
    config: {
        apiKey: null,
        units: 'metric',
        cacheTimeout: 300000, // 5 minutes
        maxLocations: 10
    },
    
    async initialize(config, context) {
        if (!config.apiKey) {
            throw new Error('Weather API key is required');
        }
        
        context.log('Weather service plugin initializing...');
        
        return {
            config: config,
            cache: new Map(),
            requestCount: 0,
            lastRequest: null
        };
    },
    
    async destroy(instance) {
        instance.cache.clear();
        console.log(`Weather plugin shutdown. Made ${instance.requestCount} requests.`);
    },
    
    exports: {
        actions: {
            async weather_current(args, context, instance) {
                const location = args[0];
                if (!location) {
                    throw new Error('Location is required');
                }
                
                const cacheKey = `current:${location}`;
                const cached = getCachedResult(instance.cache, cacheKey, instance.config.cacheTimeout);
                
                if (cached) {
                    context.log('Using cached weather data');
                    setWeatherVariables(context, cached);
                    return `Current weather for ${location} (cached)`;
                }
                
                instance.requestCount++;
                instance.lastRequest = new Date();
                
                const weather = await fetchCurrentWeather(location, instance.config.apiKey);
                instance.cache.set(cacheKey, { data: weather, timestamp: Date.now() });
                
                setWeatherVariables(context, weather);
                return `Current weather for ${location} retrieved`;
            },
            
            async weather_forecast(args, context, instance) {
                const location = args[0];
                const days = Math.min(parseInt(args[1]) || 3, 7);
                
                const forecast = await fetchForecast(location, days, instance.config.apiKey);
                
                context.setVariable('forecast_location', location);
                context.setVariable('forecast_days', days.toString());
                context.setVariable('forecast_summary', summarizeForecast(forecast));
                
                return `${days}-day forecast for ${location} ready`;
            },
            
            async weather_alerts(args, context, instance) {
                const location = args[0];
                const alerts = await fetchWeatherAlerts(location, instance.config.apiKey);
                
                context.setVariable('alert_count', alerts.length.toString());
                context.setVariable('alerts_summary', alerts.map(a => a.title).join(', '));
                
                return alerts.length > 0 ? 
                    `${alerts.length} weather alerts for ${location}` : 
                    `No weather alerts for ${location}`;
            }
        }
    }
};

function setWeatherVariables(context, weather) {
    context.setVariable('weather_temp', weather.temperature.toString());
    context.setVariable('weather_desc', weather.description);
    context.setVariable('weather_humidity', weather.humidity.toString());
    context.setVariable('weather_wind', weather.windSpeed.toString());
}

function getCachedResult(cache, key, timeout) {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < timeout) {
        return cached.data;
    }
    return null;
}

// MoringaScript usage
const weatherScript = `
recognizer "weather in [city]"
    do "weather_current [city]"
    say "It's [weather_temp]°C in [weather_location] with [weather_desc]"

recognizer "forecast for [city]"
    do "weather_forecast [city] 5"
    say "[forecast_summary]"

recognizer "any weather alerts for [city]"
    do "weather_alerts [city]"
    say "[alerts_summary]"
`;
```

## API Reference

### MoringaEnhanced Methods

#### `registerPlugin(plugin)`
Register a plugin with the system.
- **plugin**: Plugin definition object
- **Returns**: `boolean` - Success status

#### `loadPlugin(name, config)`
Load a registered plugin.
- **name**: Plugin name
- **config**: Optional configuration overrides
- **Returns**: `Promise<boolean>` - Success status

#### `unloadPlugin(name)`
Unload a loaded plugin.
- **name**: Plugin name
- **Returns**: `Promise<boolean>` - Success status

#### `listPlugins(type)`
Get list of registered plugins.
- **type**: Optional plugin type filter
- **Returns**: `Array` - Plugin information

#### `getPluginStatus()`
Get plugin system status.
- **Returns**: `Object` - Status information

### Plugin Context Methods

#### `setVariable(name, value)`
Set a variable in the current context.

#### `getVariable(name)`
Get a variable from the current context.

#### `setMemory(statement)`
Store a memory.

#### `log(message)`
Log a message with plugin name prefix.

#### `addHook(hookName, callback)`
Register a hook callback.

### Hook Types

- `beforeInput` - Called before input processing
- `afterInput` - Called after input processing  
- `beforeAction` - Called before action execution
- `afterAction` - Called after action execution
- `beforeMemoryOperation` - Called before memory operations
- `afterMemoryOperation` - Called after memory operations

## Conclusion

The Moringa Plugin System provides a robust foundation for extending conversational AI capabilities. By following the patterns and practices outlined in this guide, you can create powerful, reusable plugins that enhance your bots while maintaining clean separation of concerns.

For more examples and advanced use cases, see the `plugins/` directory and the comprehensive demonstration script `test_plugin_system.js`.