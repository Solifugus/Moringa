/**
 * Moringa Enhanced Pattern Engine
 * Advanced pattern matching with priority system and multi-pattern recognition
 */

const { MoringaPluginSystem } = require('./moringa-plugin-system.js');

class MoringaPatternEngine {
    constructor() {
        this.pluginSystem = new MoringaPluginSystem();
        this.patternCache = new Map();
        this.statistics = {
            totalMatches: 0,
            patternHits: new Map(),
            performanceMetrics: []
        };
    }

    /**
     * Enhanced pattern matching with priority and multi-pattern support
     * @param {string} input - User input
     * @param {Array} recognizers - Available recognizers
     * @param {Object} context - Matching context
     * @returns {Object|Array} Match result(s)
     */
    async matchPatterns(input, recognizers, context = {}) {
        const startTime = performance.now();

        // Prepare patterns with priority information
        const prioritizedPatterns = this.preparePatternsWithPriority(recognizers);

        // Multi-pattern matching mode
        if (context.multiMatch) {
            return await this.performMultiPatternMatching(input, prioritizedPatterns, context);
        }

        // Single best pattern matching (default)
        const result = await this.performSinglePatternMatching(input, prioritizedPatterns, context);

        // Record performance metrics
        const duration = performance.now() - startTime;
        this.recordPerformanceMetric(input, result, duration);

        return result;
    }

    /**
     * Prepare patterns with priority information
     */
    preparePatternsWithPriority(recognizers) {
        const patterns = [];

        for (const recognizer of recognizers) {
            const pattern = {
                id: recognizer.id || this.generatePatternId(recognizer),
                text: recognizer.pattern,
                priority: recognizer.priority || 0,
                type: recognizer.type || 'standard',
                context: recognizer.context || 'default',
                recognizer: recognizer,
                metadata: {
                    complexity: this.calculatePatternComplexity(recognizer.pattern),
                    variableCount: this.countVariables(recognizer.pattern),
                    lastUsed: recognizer.lastUsed || null
                }
            };

            patterns.push(pattern);
        }

        // Sort by priority (higher first), then by type preference
        return patterns.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority; // Higher priority first
            }

            // Tie-breaker: prefer exact matches over fuzzy
            const typeOrder = { exact: 3, regex: 2, fuzzy: 1, semantic: 0 };
            return (typeOrder[b.type] || 0) - (typeOrder[a.type] || 0);
        });
    }

    /**
     * Single pattern matching - returns the best match
     */
    async performSinglePatternMatching(input, patterns, context) {
        let bestMatch = null;
        let bestScore = 0;

        // Try each pattern in priority order
        for (const pattern of patterns) {
            const match = await this.testPattern(input, pattern, context);

            if (match && match.score > bestScore) {
                bestScore = match.score;
                bestMatch = match;

                // Early exit for high-confidence exact matches
                if (match.score >= 0.95 && pattern.type === 'exact') {
                    break;
                }
            }
        }

        if (bestMatch) {
            this.recordPatternHit(bestMatch.pattern);
            this.statistics.totalMatches++;
        }

        return bestMatch;
    }

    /**
     * Multi-pattern matching - returns all matches above threshold
     */
    async performMultiPatternMatching(input, patterns, context) {
        const matches = [];
        const threshold = context.threshold || 0.7;

        for (const pattern of patterns) {
            const match = await this.testPattern(input, pattern, context);

            if (match && match.score >= threshold) {
                matches.push(match);
            }
        }

        // Sort matches by score (best first)
        matches.sort((a, b) => b.score - a.score);

        // Apply multi-match limit if specified
        if (context.maxMatches && matches.length > context.maxMatches) {
            return matches.slice(0, context.maxMatches);
        }

        return matches;
    }

    /**
     * Test a single pattern against input
     */
    async testPattern(input, pattern, context) {
        try {
            // Check cache first
            const cacheKey = `${pattern.id}:${input}`;
            if (this.patternCache.has(cacheKey)) {
                return this.patternCache.get(cacheKey);
            }

            let result = null;

            // Determine matching strategy
            switch (pattern.type) {
                case 'regex':
                    result = await this.matchRegexPattern(input, pattern, context);
                    break;

                case 'fuzzy':
                    result = await this.matchFuzzyPattern(input, pattern, context);
                    break;

                case 'semantic':
                    result = await this.matchSemanticPattern(input, pattern, context);
                    break;

                case 'exact':
                default:
                    result = await this.matchExactPattern(input, pattern, context);
                    break;
            }

            // Apply pattern-specific adjustments
            if (result) {
                result = this.adjustMatchScore(result, pattern, context);
            }

            // Cache result
            this.patternCache.set(cacheKey, result);

            return result;

        } catch (error) {
            console.error(`Pattern matching error for pattern '${pattern.text}': ${error.message}`);
            return null;
        }
    }

    /**
     * Exact pattern matching with variable extraction
     */
    async matchExactPattern(input, pattern, context) {
        const variables = {};
        let patternRegex = pattern.text;

        // Replace variable placeholders with regex groups
        const variableMatches = pattern.text.match(/\[([^\]]+)\]/g) || [];
        const variableNames = [];

        for (const varMatch of variableMatches) {
            const varName = varMatch.slice(1, -1); // Remove brackets
            variableNames.push(varName);
            patternRegex = patternRegex.replace(varMatch, '(.+?)');
        }

        try {
            const regex = new RegExp(`^${patternRegex}$`, 'i');
            const match = input.match(regex);

            if (match) {
                // Extract variables
                for (let i = 0; i < variableNames.length; i++) {
                    if (match[i + 1]) {
                        variables[variableNames[i]] = match[i + 1].trim();
                    }
                }

                return {
                    pattern: pattern,
                    score: 1.0, // Exact match
                    method: 'exact',
                    confidence: 1.0,
                    variables: variables,
                    matchedText: match[0]
                };
            }
        } catch (error) {
            console.error(`Exact pattern regex error: ${error.message}`);
        }

        return null;
    }

    /**
     * Regex pattern matching using plugins
     */
    async matchRegexPattern(input, pattern, context) {
        // Use regex plugin if available
        for (const [name, plugin] of this.pluginSystem.plugins) {
            if (plugin.status === 'loaded' &&
                plugin.type === 'pattern' &&
                plugin.exports.matcher &&
                name.includes('regex')) {

                const result = await plugin.exports.matcher(input, [pattern], context, plugin.instance);
                return result;
            }
        }

        // Fallback to basic regex handling
        return this.matchExactPattern(input, pattern, context);
    }

    /**
     * Fuzzy pattern matching using plugins
     */
    async matchFuzzyPattern(input, pattern, context) {
        // Use fuzzy plugin if available
        for (const [name, plugin] of this.pluginSystem.plugins) {
            if (plugin.status === 'loaded' &&
                plugin.type === 'pattern' &&
                plugin.exports.matcher &&
                name.includes('fuzzy')) {

                const result = await plugin.exports.matcher(input, [pattern], context, plugin.instance);
                return result;
            }
        }

        // Fallback to exact matching
        return this.matchExactPattern(input, pattern, context);
    }

    /**
     * Semantic pattern matching using plugins
     */
    async matchSemanticPattern(input, pattern, context) {
        // Use semantic plugin if available
        for (const [name, plugin] of this.pluginSystem.plugins) {
            if (plugin.status === 'loaded' &&
                plugin.type === 'pattern' &&
                plugin.exports.matcher &&
                name.includes('semantic')) {

                const result = await plugin.exports.matcher(input, [pattern], context, plugin.instance);
                return result;
            }
        }

        // Fallback to exact matching
        return this.matchExactPattern(input, pattern, context);
    }

    /**
     * Adjust match scores based on pattern characteristics
     */
    adjustMatchScore(result, pattern, context) {
        let adjustedScore = result.score;

        // Priority boost
        if (pattern.priority > 0) {
            adjustedScore += (pattern.priority * 0.1);
        }

        // Recent usage boost
        if (pattern.metadata.lastUsed) {
            const daysSinceUsed = (Date.now() - pattern.metadata.lastUsed) / (1000 * 60 * 60 * 24);
            if (daysSinceUsed < 7) {
                adjustedScore += 0.05; // Small boost for recently used patterns
            }
        }

        // Complexity penalty for overly complex patterns
        if (pattern.metadata.complexity > 50) {
            adjustedScore -= 0.05;
        }

        // Context relevance boost
        if (pattern.context === context.currentContext) {
            adjustedScore += 0.1;
        }

        // Ensure score doesn't exceed 1.0
        adjustedScore = Math.min(adjustedScore, 1.0);

        return {
            ...result,
            originalScore: result.score,
            score: adjustedScore,
            adjustments: {
                priority: pattern.priority > 0 ? pattern.priority * 0.1 : 0,
                recentUsage: pattern.metadata.lastUsed ? 0.05 : 0,
                complexity: pattern.metadata.complexity > 50 ? -0.05 : 0,
                context: pattern.context === context.currentContext ? 0.1 : 0
            }
        };
    }

    /**
     * Calculate pattern complexity score
     */
    calculatePatternComplexity(pattern) {
        let score = pattern.length;
        score += (pattern.match(/\[([^\]]+)\]/g) || []).length * 5; // Variables
        score += (pattern.match(/[.*+?^${}()|[\]\\]/g) || []).length * 2; // Regex chars
        return score;
    }

    /**
     * Count variables in pattern
     */
    countVariables(pattern) {
        return (pattern.match(/\[([^\]]+)\]/g) || []).length;
    }

    /**
     * Generate unique pattern ID
     */
    generatePatternId(recognizer) {
        const hash = this.simpleHash(recognizer.pattern + (recognizer.context || ''));
        return `pattern_${hash}`;
    }

    /**
     * Simple hash function
     */
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Record pattern hit for statistics
     */
    recordPatternHit(pattern) {
        const key = pattern.id || pattern.text;
        const current = this.statistics.patternHits.get(key) || 0;
        this.statistics.patternHits.set(key, current + 1);

        // Update last used timestamp
        if (pattern.recognizer) {
            pattern.recognizer.lastUsed = Date.now();
        }
    }

    /**
     * Record performance metrics
     */
    recordPerformanceMetric(input, result, duration) {
        this.statistics.performanceMetrics.push({
            timestamp: Date.now(),
            inputLength: input.length,
            matched: !!result,
            duration: duration,
            score: result ? result.score : 0,
            method: result ? result.method : null
        });

        // Keep only recent metrics (last 1000)
        if (this.statistics.performanceMetrics.length > 1000) {
            this.statistics.performanceMetrics = this.statistics.performanceMetrics.slice(-1000);
        }
    }

    /**
     * Get pattern matching statistics
     */
    getStatistics() {
        return {
            ...this.statistics,
            cacheSize: this.patternCache.size,
            averageResponseTime: this.calculateAverageResponseTime(),
            topPatterns: this.getTopPatterns(10)
        };
    }

    /**
     * Calculate average response time
     */
    calculateAverageResponseTime() {
        if (this.statistics.performanceMetrics.length === 0) return 0;

        const total = this.statistics.performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0);
        return total / this.statistics.performanceMetrics.length;
    }

    /**
     * Get most frequently used patterns
     */
    getTopPatterns(limit = 10) {
        return Array.from(this.statistics.patternHits.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([pattern, hits]) => ({ pattern, hits }));
    }

    /**
     * Clear pattern cache
     */
    clearCache() {
        this.patternCache.clear();
    }

    /**
     * Reset statistics
     */
    resetStatistics() {
        this.statistics = {
            totalMatches: 0,
            patternHits: new Map(),
            performanceMetrics: []
        };
    }

    /**
     * Load pattern matcher plugins
     */
    async loadPatternPlugins() {
        const { fuzzyMatchPlugin, regexMatchPlugin, semanticMatchPlugin } = require('./plugins/pattern-examples.js');

        // Register plugins
        this.pluginSystem.registerPlugin(fuzzyMatchPlugin);
        this.pluginSystem.registerPlugin(regexMatchPlugin);
        this.pluginSystem.registerPlugin(semanticMatchPlugin);

        // Load plugins
        await this.pluginSystem.loadPlugin('fuzzy-matcher');
        await this.pluginSystem.loadPlugin('regex-matcher');
        await this.pluginSystem.loadPlugin('semantic-matcher');

        console.log('✅ Pattern matching plugins loaded');
    }
}

module.exports = { MoringaPatternEngine };