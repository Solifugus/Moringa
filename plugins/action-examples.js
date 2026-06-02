/**
 * Example Action Plugins for Moringa
 * Demonstrates how to create custom action commands
 */

// HTTP Request Plugin
const httpPlugin = {
    name: 'http-actions',
    version: '1.0.0',
    type: 'action',
    description: 'HTTP request actions for API integration',
    config: {
        timeout: 5000,
        maxRetries: 3,
        defaultHeaders: {
            'User-Agent': 'Moringa-Bot/1.0'
        }
    },

    async initialize(config, context) {
        context.log('HTTP Actions plugin initializing...');
        return {
            config,
            stats: {
                requests: 0,
                errors: 0
            }
        };
    },

    async destroy(instance) {
        console.log(`HTTP plugin shutting down. Stats: ${instance.stats.requests} requests, ${instance.stats.errors} errors`);
    },

    exports: {
        actions: {
            /**
             * Make HTTP GET request
             * Usage: do "http_get https://api.example.com/data"
             */
            async http_get(args, context, instance) {
                const url = args[0];
                if (!url) {
                    throw new Error('URL is required for http_get');
                }

                try {
                    instance.stats.requests++;

                    // Simulate HTTP request (in real implementation, use fetch/axios)
                    const response = await simulateHttpRequest('GET', url);

                    context.setVariable('http_status', response.status.toString());
                    context.setVariable('http_data', JSON.stringify(response.data));

                    return `HTTP GET to ${url} completed with status ${response.status}`;

                } catch (error) {
                    instance.stats.errors++;
                    throw new Error(`HTTP GET failed: ${error.message}`);
                }
            },

            /**
             * Make HTTP POST request
             * Usage: do "http_post https://api.example.com/submit [data]"
             */
            async http_post(args, context, instance) {
                const url = args[0];
                const data = args[1] || '{}';

                if (!url) {
                    throw new Error('URL is required for http_post');
                }

                try {
                    instance.stats.requests++;

                    const response = await simulateHttpRequest('POST', url, JSON.parse(data));

                    context.setVariable('http_status', response.status.toString());
                    context.setVariable('http_data', JSON.stringify(response.data));

                    return `HTTP POST to ${url} completed with status ${response.status}`;

                } catch (error) {
                    instance.stats.errors++;
                    throw new Error(`HTTP POST failed: ${error.message}`);
                }
            }
        }
    }
};

// File System Plugin
const fileSystemPlugin = {
    name: 'file-actions',
    version: '1.0.0',
    type: 'action',
    description: 'File system operations for reading/writing files',
    config: {
        allowedPaths: ['./data/', './uploads/'],
        maxFileSize: 1024 * 1024 // 1MB
    },

    async initialize(config, context) {
        context.log('File System Actions plugin initializing...');
        return {
            config,
            stats: {
                reads: 0,
                writes: 0
            }
        };
    },

    exports: {
        actions: {
            /**
             * Read file contents
             * Usage: do "read_file ./data/info.txt"
             */
            async read_file(args, context, instance) {
                const filePath = args[0];
                if (!filePath) {
                    throw new Error('File path is required for read_file');
                }

                // Check if path is allowed
                const isAllowed = instance.config.allowedPaths.some(allowed =>
                    filePath.startsWith(allowed));

                if (!isAllowed) {
                    throw new Error(`Access denied: ${filePath} is not in allowed paths`);
                }

                try {
                    instance.stats.reads++;

                    // Simulate file read
                    const content = await simulateFileRead(filePath);
                    context.setVariable('file_content', content);
                    context.setVariable('file_path', filePath);

                    return `File ${filePath} read successfully (${content.length} chars)`;

                } catch (error) {
                    throw new Error(`Failed to read file: ${error.message}`);
                }
            },

            /**
             * Write file contents
             * Usage: do "write_file ./data/output.txt [content]"
             */
            async write_file(args, context, instance) {
                const filePath = args[0];
                const content = args[1] || '';

                if (!filePath) {
                    throw new Error('File path is required for write_file');
                }

                // Check if path is allowed
                const isAllowed = instance.config.allowedPaths.some(allowed =>
                    filePath.startsWith(allowed));

                if (!isAllowed) {
                    throw new Error(`Access denied: ${filePath} is not in allowed paths`);
                }

                // Check file size limit
                if (content.length > instance.config.maxFileSize) {
                    throw new Error(`Content too large: ${content.length} bytes exceeds limit`);
                }

                try {
                    instance.stats.writes++;

                    // Simulate file write
                    await simulateFileWrite(filePath, content);
                    context.setVariable('file_path', filePath);
                    context.setVariable('bytes_written', content.length.toString());

                    return `File ${filePath} written successfully (${content.length} bytes)`;

                } catch (error) {
                    throw new Error(`Failed to write file: ${error.message}`);
                }
            }
        }
    }
};

// Math Operations Plugin
const mathPlugin = {
    name: 'math-actions',
    version: '1.0.0',
    type: 'action',
    description: 'Mathematical operations and calculations',
    config: {
        precision: 2,
        maxValue: 1000000
    },

    async initialize(config, context) {
        context.log('Math Actions plugin initializing...');
        return { config };
    },

    exports: {
        actions: {
            /**
             * Calculate mathematical expression
             * Usage: do "calculate 2 + 3 * 4"
             */
            async calculate(args, context, instance) {
                const expression = args.join(' ');
                if (!expression) {
                    throw new Error('Expression is required for calculate');
                }

                try {
                    // Safe expression evaluation (in real implementation, use a proper parser)
                    const result = evaluateExpression(expression);

                    if (Math.abs(result) > instance.config.maxValue) {
                        throw new Error(`Result exceeds maximum value: ${instance.config.maxValue}`);
                    }

                    const rounded = Number(result.toFixed(instance.config.precision));
                    context.setVariable('calculation_result', rounded.toString());
                    context.setVariable('calculation_expression', expression);

                    return `${expression} = ${rounded}`;

                } catch (error) {
                    throw new Error(`Calculation failed: ${error.message}`);
                }
            },

            /**
             * Generate random number
             * Usage: do "random 1 100"
             */
            async random(args, context, instance) {
                const min = parseInt(args[0]) || 0;
                const max = parseInt(args[1]) || 100;

                if (min >= max) {
                    throw new Error('Minimum must be less than maximum');
                }

                const result = Math.floor(Math.random() * (max - min + 1)) + min;
                context.setVariable('random_number', result.toString());
                context.setVariable('random_min', min.toString());
                context.setVariable('random_max', max.toString());

                return `Random number between ${min} and ${max}: ${result}`;
            }
        }
    }
};

// Utility functions for simulation (in real implementation, use actual APIs)

async function simulateHttpRequest(method, url, data = null) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate different responses based on URL
    if (url.includes('error')) {
        throw new Error('HTTP request failed');
    }

    return {
        status: 200,
        data: {
            method,
            url,
            timestamp: new Date().toISOString(),
            requestData: data
        }
    };
}

async function simulateFileRead(filePath) {
    await new Promise(resolve => setTimeout(resolve, 50));

    if (filePath.includes('missing')) {
        throw new Error('File not found');
    }

    return `Content of ${filePath}\nTimestamp: ${new Date().toISOString()}`;
}

async function simulateFileWrite(filePath, content) {
    await new Promise(resolve => setTimeout(resolve, 50));

    if (filePath.includes('readonly')) {
        throw new Error('Permission denied');
    }

    // Simulate successful write
    return true;
}

function evaluateExpression(expression) {
    // Very basic expression evaluator - in real implementation, use a proper parser
    // This is just for demonstration and should NOT be used in production
    const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, '');

    try {
        // WARNING: eval is dangerous - use a proper math parser in production
        return Function(`"use strict"; return (${sanitized})`)();
    } catch (error) {
        throw new Error('Invalid expression');
    }
}

module.exports = {
    httpPlugin,
    fileSystemPlugin,
    mathPlugin
};