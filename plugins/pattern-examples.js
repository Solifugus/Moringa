/**
 * Example Pattern Matcher Plugins for Moringa
 * Demonstrates how to create custom pattern matching logic
 */

// Fuzzy String Matching Plugin
const fuzzyMatchPlugin = {
    name: 'fuzzy-matcher',
    version: '1.0.0',
    type: 'pattern',
    description: 'Fuzzy string matching for approximate pattern recognition',
    config: {
        threshold: 0.7,        // Minimum similarity score (0-1)
        maxDistance: 3,        // Maximum edit distance
        caseSensitive: false
    },

    async initialize(config, context) {
        context.log('Fuzzy Pattern Matcher plugin initializing...');
        return {
            config,
            stats: {
                matches: 0,
                rejections: 0
            }
        };
    },

    exports: {
        /**
         * Fuzzy pattern matcher
         * @param {string} input - User input
         * @param {Array} patterns - Available patterns to match
         * @param {Object} context - Match context
         * @param {Object} instance - Plugin instance
         * @returns {Object|null} Match result
         */
        async matcher(input, patterns, context, instance) {
            if (!input || !patterns.length) return null;

            const config = instance.config;
            const processedInput = config.caseSensitive ? input : input.toLowerCase();

            let bestMatch = null;
            let bestScore = 0;

            for (const pattern of patterns) {
                const processedPattern = config.caseSensitive ? pattern.text : pattern.text.toLowerCase();

                // Calculate similarity score using Levenshtein distance
                const distance = calculateLevenshteinDistance(processedInput, processedPattern);
                const maxLength = Math.max(processedInput.length, processedPattern.length);
                const similarity = 1 - (distance / maxLength);

                // Check if this is a good enough match
                if (similarity >= config.threshold &&
                    distance <= config.maxDistance &&
                    similarity > bestScore) {

                    bestScore = similarity;
                    bestMatch = {
                        pattern: pattern,
                        score: similarity,
                        distance: distance,
                        method: 'fuzzy',
                        confidence: similarity,
                        variables: extractVariables(input, pattern.text)
                    };
                }
            }

            if (bestMatch) {
                instance.stats.matches++;
            } else {
                instance.stats.rejections++;
            }

            return bestMatch;
        }
    }
};

// Regex Pattern Matcher Plugin
const regexMatchPlugin = {
    name: 'regex-matcher',
    version: '1.0.0',
    type: 'pattern',
    description: 'Regular expression pattern matching for complex patterns',
    config: {
        flags: 'i',            // Regex flags (i = case insensitive)
        maxComplexity: 100     // Maximum regex complexity score
    },

    async initialize(config, context) {
        context.log('Regex Pattern Matcher plugin initializing...');
        return {
            config,
            compiledPatterns: new Map(),
            stats: {
                matches: 0,
                compilationErrors: 0
            }
        };
    },

    exports: {
        async matcher(input, patterns, context, instance) {
            if (!input || !patterns.length) return null;

            let bestMatch = null;
            let bestScore = 0;

            for (const pattern of patterns) {
                // Skip non-regex patterns
                if (!pattern.text.startsWith('/') || !pattern.text.endsWith('/')) {
                    continue;
                }

                try {
                    // Extract regex pattern (remove leading/trailing slashes)
                    const regexPattern = pattern.text.slice(1, -1);

                    // Check complexity
                    if (calculateRegexComplexity(regexPattern) > instance.config.maxComplexity) {
                        continue;
                    }

                    // Compile regex (with caching)
                    let regex = instance.compiledPatterns.get(pattern.text);
                    if (!regex) {
                        regex = new RegExp(regexPattern, instance.config.flags);
                        instance.compiledPatterns.set(pattern.text, regex);
                    }

                    // Test match
                    const match = regex.exec(input);
                    if (match) {
                        // Calculate match score based on how much of the input was matched
                        const score = match[0].length / input.length;

                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = {
                                pattern: pattern,
                                score: score,
                                method: 'regex',
                                confidence: score,
                                match: match[0],
                                groups: match.slice(1),
                                variables: extractRegexVariables(match, pattern)
                            };
                        }

                        instance.stats.matches++;
                    }

                } catch (error) {
                    instance.stats.compilationErrors++;
                    console.error(`Regex compilation error for pattern '${pattern.text}': ${error.message}`);
                }
            }

            return bestMatch;
        }
    }
};

// Semantic Pattern Matcher Plugin (simulated)
const semanticMatchPlugin = {
    name: 'semantic-matcher',
    version: '1.0.0',
    type: 'pattern',
    description: 'Semantic pattern matching using word embeddings and context',
    config: {
        threshold: 0.6,
        useWordNet: true,
        contextWeight: 0.3
    },

    async initialize(config, context) {
        context.log('Semantic Pattern Matcher plugin initializing...');

        // In a real implementation, this would load word embeddings
        const synonymMap = new Map([
            ['hello', ['hi', 'hey', 'greetings', 'salutations']],
            ['goodbye', ['bye', 'farewell', 'see you', 'later']],
            ['help', ['assist', 'support', 'aid', 'guidance']],
            ['name', ['title', 'called', 'known as', 'named']],
            ['like', ['enjoy', 'prefer', 'love', 'fancy']]
        ]);

        return {
            config,
            synonymMap,
            stats: {
                matches: 0,
                semanticHits: 0
            }
        };
    },

    exports: {
        async matcher(input, patterns, context, instance) {
            if (!input || !patterns.length) return null;

            const inputWords = tokenize(input.toLowerCase());
            let bestMatch = null;
            let bestScore = 0;

            for (const pattern of patterns) {
                const patternWords = tokenize(pattern.text.toLowerCase());

                // Calculate semantic similarity
                const similarity = calculateSemanticSimilarity(
                    inputWords,
                    patternWords,
                    instance.synonymMap
                );

                if (similarity >= instance.config.threshold && similarity > bestScore) {
                    bestScore = similarity;
                    bestMatch = {
                        pattern: pattern,
                        score: similarity,
                        method: 'semantic',
                        confidence: similarity,
                        variables: extractSemanticVariables(input, pattern.text, instance.synonymMap)
                    };

                    instance.stats.matches++;
                    if (similarity > 0.8) {
                        instance.stats.semanticHits++;
                    }
                }
            }

            return bestMatch;
        }
    }
};

// Utility functions

function calculateLevenshteinDistance(str1, str2) {
    const matrix = [];

    // Create matrix
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[str2.length][str1.length];
}

function calculateRegexComplexity(pattern) {
    // Simple complexity scoring - in real implementation, use proper analysis
    let score = pattern.length;
    score += (pattern.match(/[.*+?^${}()|[\]\\]/g) || []).length * 2;
    score += (pattern.match(/\+|\*/g) || []).length * 3;
    score += (pattern.match(/\{[^}]*\}/g) || []).length * 5;
    return score;
}

function extractVariables(input, pattern) {
    // Simple variable extraction - in real implementation, use proper parsing
    const variables = {};
    const varPattern = /\[([^\]]+)\]/g;
    let match;

    while ((match = varPattern.exec(pattern)) !== null) {
        const varName = match[1];
        // In real implementation, extract actual variable values from input
        variables[varName] = input; // Placeholder
    }

    return variables;
}

function extractRegexVariables(regexMatch, pattern) {
    const variables = {};

    // Extract named groups if available
    if (regexMatch.groups) {
        Object.assign(variables, regexMatch.groups);
    }

    return variables;
}

function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);
}

function calculateSemanticSimilarity(words1, words2, synonymMap) {
    if (!words1.length || !words2.length) return 0;

    let totalMatches = 0;
    let maxMatches = Math.max(words1.length, words2.length);

    for (const word1 of words1) {
        let bestMatch = 0;

        for (const word2 of words2) {
            let similarity = 0;

            // Exact match
            if (word1 === word2) {
                similarity = 1.0;
            }
            // Check synonyms
            else if (synonymMap.has(word1) && synonymMap.get(word1).includes(word2)) {
                similarity = 0.8;
            }
            else if (synonymMap.has(word2) && synonymMap.get(word2).includes(word1)) {
                similarity = 0.8;
            }

            bestMatch = Math.max(bestMatch, similarity);
        }

        totalMatches += bestMatch;
    }

    return totalMatches / maxMatches;
}

function extractSemanticVariables(input, pattern, synonymMap) {
    // Simplified semantic variable extraction
    const variables = {};
    const varPattern = /\[([^\]]+)\]/g;
    let match;

    while ((match = varPattern.exec(pattern)) !== null) {
        const varName = match[1];
        // In real implementation, use semantic parsing to extract values
        variables[varName] = input; // Placeholder
    }

    return variables;
}

module.exports = {
    fuzzyMatchPlugin,
    regexMatchPlugin,
    semanticMatchPlugin
};