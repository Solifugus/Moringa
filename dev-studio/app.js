/**
 * Moringa Development Studio - Frontend Application
 * Vanilla JavaScript SPA for visual chatbot development
 */

class MoringaDevStudio {
    constructor() {
        this.sessionId = null;
        this.currentScript = null;
        this.currentAgent = null;
        this.scripts = new Map();
        this.agents = new Map();
        this.tabs = new Map();
        this.activeTab = null;
        this.settings = this.loadSettings();

        // AI Integration
        this.aiEnabled = false;
        this.aiProvider = 'none';
        this.aiFeatures = {};

        // API endpoints
        this.apiBase = '/api';

        // UI elements
        this.elements = {};

        // Event source for real-time updates
        this.eventSource = null;

        // Auto-save timer
        this.autoSaveTimer = null;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('🚀 Initializing Moringa Development Studio');

        try {
            this.cacheElements();
            this.bindEvents();
            await this.createSession();
            await this.checkAIStatus(); // Initialize AI features
            this.setupEventSource();
            this.applyTheme();
            this.showToast('Studio initialized successfully', 'success');

            console.log('✅ Studio ready');
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.showToast('Failed to initialize studio', 'error');
        }
    }

    /**
     * Cache DOM elements for performance
     */
    cacheElements() {
        this.elements = {
            // Header elements
            connectionStatus: document.getElementById('connection-status'),
            currentProject: document.getElementById('current-project'),

            // Sidebar elements
            scriptList: document.getElementById('script-list'),
            agentList: document.getElementById('agent-list'),

            // Tab system
            tabList: document.getElementById('tab-list'),
            tabContent: document.querySelector('.tab-content'),

            // Buttons
            newScriptBtn: document.getElementById('new-script-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            quickStartBtn: document.getElementById('quick-start-btn'),

            // Modals
            newScriptModal: document.getElementById('new-script-modal'),
            settingsModal: document.getElementById('settings-modal'),

            // Forms
            newScriptForm: document.getElementById('new-script-form'),

            // Templates
            scriptTabTemplate: document.getElementById('tab-script-template'),
            chatTabTemplate: document.getElementById('tab-chat-template'),

            // Toast container
            toastContainer: document.getElementById('toast-container'),

            // Loading spinner
            loadingSpinner: document.getElementById('loading-spinner'),

            // Side panel
            sidePanel: document.getElementById('side-panel'),
            sidePanelTitle: document.getElementById('side-panel-title'),
            sidePanelContent: document.getElementById('side-panel-content'),
            closeSidePanelBtn: document.getElementById('close-side-panel')
        };
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Header buttons
        this.elements.newScriptBtn?.addEventListener('click', () => this.openNewScriptModal());
        this.elements.settingsBtn?.addEventListener('click', () => this.openSettingsModal());
        this.elements.quickStartBtn?.addEventListener('click', () => this.createQuickStartScript());

        // Modal events
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // New script form
        this.elements.newScriptForm?.addEventListener('submit', (e) => this.handleNewScriptSubmit(e));

        // Cancel buttons
        document.getElementById('cancel-new-script')?.addEventListener('click', () =>
            this.closeModal(this.elements.newScriptModal));
        document.getElementById('cancel-settings')?.addEventListener('click', () =>
            this.closeModal(this.elements.settingsModal));

        // Settings form
        document.getElementById('save-settings')?.addEventListener('click', () => this.saveSettings());

        // Tab system
        this.elements.tabList?.addEventListener('click', (e) => this.handleTabClick(e));

        // Tool buttons
        document.getElementById('validator-btn')?.addEventListener('click', () =>
            this.openTab('validator', '✓ Validator', 'validator'));
        document.getElementById('state-machine-btn')?.addEventListener('click', () =>
            this.openTab('statemachine', '🗂️ State Machine', 'statemachine'));

        // Side panel
        this.elements.closeSidePanelBtn?.addEventListener('click', () => this.closeSidePanel());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Window events
        window.addEventListener('beforeunload', (e) => this.handleBeforeUnload(e));
        window.addEventListener('resize', () => this.handleResize());

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });

        // === AI EVENT HANDLERS ===

        // AI Pattern Suggestions
        document.getElementById('ai-suggest-btn')?.addEventListener('click', () => this.handleAIPatternSuggestions());

        // AI Input - Enter key support
        document.getElementById('ai-goal-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAIPatternSuggestions();
            }
        });

        // AI Script Analysis
        document.getElementById('ai-analyze-script-btn')?.addEventListener('click', () => this.handleAIScriptAnalysis());

        // AI Conversation Analysis
        document.getElementById('ai-analyze-conversation-btn')?.addEventListener('click', () => this.handleAIConversationAnalysis());

        // AI Suggestion Actions
        document.getElementById('ai-insert-all-btn')?.addEventListener('click', () => this.handleInsertAllSuggestions());
        document.getElementById('ai-clear-suggestions-btn')?.addEventListener('click', () => this.handleClearSuggestions());
    }

    /**
     * Create a new session
     */
    async createSession() {
        try {
            const response = await this.apiCall('POST', '/session/create');
            if (response.success) {
                this.sessionId = response.sessionId;
                this.updateConnectionStatus('connected');
                console.log('📝 Session created:', this.sessionId);
            }
        } catch (error) {
            console.error('❌ Failed to create session:', error);
            this.updateConnectionStatus('disconnected');
            throw error;
        }
    }

    /**
     * Setup Server-Sent Events for real-time updates
     */
    setupEventSource() {
        if (!this.sessionId) return;

        try {
            this.eventSource = new EventSource(`${this.apiBase}/events/${this.sessionId}`);

            this.eventSource.onopen = () => {
                console.log('🔗 EventSource connected');
            };

            this.eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleServerEvent(data);
                } catch (error) {
                    console.error('Failed to parse server event:', error);
                }
            };

            this.eventSource.onerror = () => {
                console.warn('⚠️ EventSource error, retrying...');
                this.updateConnectionStatus('disconnected');

                // Retry connection after 5 seconds
                setTimeout(() => {
                    if (this.eventSource.readyState === EventSource.CLOSED) {
                        this.setupEventSource();
                    }
                }, 5000);
            };

        } catch (error) {
            console.error('❌ Failed to setup EventSource:', error);
        }
    }

    /**
     * Handle server-sent events
     */
    handleServerEvent(data) {
        switch (data.type) {
            case 'connected':
                this.updateConnectionStatus('connected');
                break;
            case 'heartbeat':
                // Keep connection alive
                break;
            default:
                console.log('Server event:', data);
        }
    }

    /**
     * Update connection status in UI
     */
    updateConnectionStatus(status) {
        if (this.elements.connectionStatus) {
            this.elements.connectionStatus.textContent = status === 'connected' ? 'Connected' : 'Disconnected';
            this.elements.connectionStatus.className = `status-${status}`;
        }
    }

    /**
     * API call helper
     */
    async apiCall(method, endpoint, data = null) {
        const url = `${this.apiBase}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (data) {
            if (method === 'GET') {
                const params = new URLSearchParams(data);
                url = `${url}?${params}`;
            } else {
                options.body = JSON.stringify(data);
            }
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `HTTP ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error(`API call failed: ${method} ${endpoint}`, error);
            throw error;
        }
    }

    // === AI INTEGRATION METHODS ===

    /**
     * Check AI status and initialize AI features
     */
    async checkAIStatus() {
        try {
            const status = await this.apiCall('GET', '/ai/status');

            this.aiEnabled = status.enabled;
            this.aiProvider = status.provider;
            this.aiFeatures = status.features || {};

            if (this.aiEnabled) {
                console.log(`🤖 AI features enabled with ${this.aiProvider}`);
                this.showAIStatusInUI(true);
                this.enableAIButtons();
            } else {
                console.log('🤖 AI features disabled');
                this.showAIStatusInUI(false);
                this.disableAIButtons();
            }
        } catch (error) {
            console.warn('AI status check failed:', error.message);
            this.aiEnabled = false;
            this.showAIStatusInUI(false);
        }
    }

    /**
     * Get AI pattern suggestions
     */
    async getAIPatternSuggestions(userGoal) {
        if (!this.aiEnabled) {
            this.showToast('AI features not available', 'warning');
            return [];
        }

        try {
            this.showLoading(true);

            const existingPatterns = Array.from(this.scripts.values())
                .filter(s => s.content)
                .flatMap(s => this.extractPatterns(s.content));

            const response = await this.apiCall('POST', '/ai/suggestions', {
                userGoal: userGoal,
                existingPatterns: existingPatterns
            });

            return response.suggestions || [];
        } catch (error) {
            console.error('AI suggestions failed:', error);
            this.showToast('Failed to get AI suggestions', 'error');
            return [];
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Analyze script with AI
     */
    async analyzeScriptWithAI(scriptContent) {
        if (!this.aiEnabled || !this.aiFeatures.scriptAnalysis) {
            this.showToast('AI script analysis not available', 'warning');
            return null;
        }

        try {
            this.showLoading(true);

            const response = await this.apiCall('POST', '/ai/analyze-script', {
                content: scriptContent
            });

            return response.analysis;
        } catch (error) {
            console.error('AI script analysis failed:', error);
            this.showToast('Failed to analyze script', 'error');
            return null;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Analyze conversation with AI
     */
    async analyzeConversationWithAI(messages) {
        if (!this.aiEnabled || !this.aiFeatures.conversationAnalytics) {
            this.showToast('AI conversation analysis not available', 'warning');
            return null;
        }

        try {
            const response = await this.apiCall('POST', '/ai/analyze-conversation', {
                messages: messages
            });

            return response.analysis;
        } catch (error) {
            console.error('AI conversation analysis failed:', error);
            this.showToast('Failed to analyze conversation', 'error');
            return null;
        }
    }

    /**
     * Extract patterns from script content
     */
    extractPatterns(content) {
        const patterns = [];
        const lines = content.split('\n');

        for (const line of lines) {
            const match = line.match(/recognizer\s+"([^"]+)"/);
            if (match) {
                patterns.push(match[1]);
            }
        }

        return patterns;
    }

    /**
     * Show AI status in UI
     */
    showAIStatusInUI(enabled) {
        // Update AI status indicator
        const aiStatusElement = document.getElementById('ai-status');
        if (aiStatusElement) {
            aiStatusElement.className = `ai-status ${enabled ? 'enabled' : 'disabled'}`;
            aiStatusElement.innerHTML = enabled
                ? `🤖 AI: ${this.aiProvider}`
                : '🤖 AI: Disabled';
        }

        // Show/hide AI panels
        const aiPanels = document.querySelectorAll('.ai-feature');
        aiPanels.forEach(panel => {
            panel.style.display = enabled ? 'block' : 'none';
        });
    }

    /**
     * Enable AI buttons
     */
    enableAIButtons() {
        const aiButtons = document.querySelectorAll('.ai-button');
        aiButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove('disabled');
        });
    }

    /**
     * Disable AI buttons
     */
    disableAIButtons() {
        const aiButtons = document.querySelectorAll('.ai-button');
        aiButtons.forEach(button => {
            button.disabled = true;
            button.classList.add('disabled');
        });
    }

    // === AI EVENT HANDLERS ===

    /**
     * Handle AI pattern suggestions request
     */
    async handleAIPatternSuggestions() {
        const goalInput = document.getElementById('ai-goal-input');
        const userGoal = goalInput?.value?.trim();

        if (!userGoal) {
            this.showToast('Please describe your chatbot goal', 'warning');
            goalInput?.focus();
            return;
        }

        try {
            const suggestions = await this.getAIPatternSuggestions(userGoal);

            if (suggestions.length > 0) {
                this.displayAISuggestions(suggestions);
                this.showToast(`Generated ${suggestions.length} pattern suggestions`, 'success');
            } else {
                this.showToast('No suggestions generated. Try a more specific goal.', 'warning');
            }
        } catch (error) {
            console.error('AI suggestions failed:', error);
            this.showToast('Failed to generate suggestions', 'error');
        }
    }

    /**
     * Display AI suggestions in the UI
     */
    displayAISuggestions(suggestions) {
        const suggestionsContainer = document.getElementById('ai-suggestions');
        const suggestionsList = document.getElementById('ai-suggestions-list');

        if (!suggestionsList) return;

        // Clear existing suggestions
        suggestionsList.innerHTML = '';

        // Add new suggestions
        suggestions.forEach((suggestion, index) => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'ai-suggestion-item';
            suggestionElement.innerHTML = `
                <div class="ai-suggestion-pattern">${this.escapeHtml(suggestion.pattern || suggestion)}</div>
                ${suggestion.description ? `<div class="ai-suggestion-description">${this.escapeHtml(suggestion.description)}</div>` : ''}
                <button class="insert-btn" data-suggestion-index="${index}">Insert</button>
            `;

            // Add click handler for insertion
            suggestionElement.addEventListener('click', () => {
                this.insertAISuggestion(suggestion);
            });

            suggestionsList.appendChild(suggestionElement);
        });

        // Show suggestions container
        suggestionsContainer.style.display = 'block';

        // Store suggestions for later use
        this.currentAISuggestions = suggestions;
    }

    /**
     * Insert AI suggestion into current editor
     */
    insertAISuggestion(suggestion) {
        const currentTab = this.getActiveScriptTab();
        if (!currentTab) {
            this.showToast('No script editor open', 'warning');
            return;
        }

        const editor = currentTab.querySelector('.script-editor');
        if (!editor) return;

        const patternText = typeof suggestion === 'string' ? suggestion : suggestion.pattern;
        const recognizerPattern = patternText.startsWith('recognizer') ?
            patternText : `recognizer "${patternText}" priority=10\n    say "Response to ${patternText}"`;

        // Insert at cursor position or append
        const cursorPosition = editor.selectionStart;
        const content = editor.value;
        const beforeCursor = content.substring(0, cursorPosition);
        const afterCursor = content.substring(cursorPosition);

        editor.value = beforeCursor + '\n' + recognizerPattern + '\n' + afterCursor;

        // Update cursor position
        const newPosition = cursorPosition + recognizerPattern.length + 2;
        editor.setSelectionRange(newPosition, newPosition);
        editor.focus();

        this.showToast('Pattern inserted', 'success');
        this.handleScriptChange(this.getScriptFromTab(currentTab));
    }

    /**
     * Handle AI script analysis
     */
    async handleAIScriptAnalysis() {
        const currentTab = this.getActiveScriptTab();
        if (!currentTab) {
            this.showToast('No script open for analysis', 'warning');
            return;
        }

        const script = this.getScriptFromTab(currentTab);
        if (!script || !script.content.trim()) {
            this.showToast('Script is empty', 'warning');
            return;
        }

        try {
            const analysis = await this.analyzeScriptWithAI(script.content);

            if (analysis) {
                this.displayAIAnalysis(analysis, 'script');
            } else {
                this.showToast('No analysis available', 'warning');
            }
        } catch (error) {
            console.error('AI script analysis failed:', error);
            this.showToast('Analysis failed', 'error');
        }
    }

    /**
     * Handle AI conversation analysis
     */
    async handleAIConversationAnalysis() {
        const currentAgent = this.getCurrentTestAgent();
        if (!currentAgent) {
            this.showToast('No active conversation to analyze', 'warning');
            return;
        }

        try {
            // Get conversation messages
            const messages = await this.apiCall('GET', `/agent/${currentAgent.id}/messages`);

            if (messages.messages && messages.messages.length > 0) {
                const analysis = await this.analyzeConversationWithAI(messages.messages);

                if (analysis) {
                    this.displayAIAnalysis(analysis, 'conversation');
                } else {
                    this.showToast('No analysis available', 'warning');
                }
            } else {
                this.showToast('No conversation to analyze', 'warning');
            }
        } catch (error) {
            console.error('AI conversation analysis failed:', error);
            this.showToast('Analysis failed', 'error');
        }
    }

    /**
     * Display AI analysis results
     */
    displayAIAnalysis(analysis, type) {
        const panelTitle = type === 'script' ? 'Script Analysis' : 'Conversation Analysis';
        const panelId = `ai-analysis-${type}`;

        // Create or update analysis panel
        let analysisPanel = document.getElementById(panelId);
        if (!analysisPanel) {
            analysisPanel = document.createElement('div');
            analysisPanel.id = panelId;
            analysisPanel.className = 'ai-analysis-panel';

            // Insert after AI suggestions or in main content
            const insertTarget = document.getElementById('ai-suggestions') ||
                                document.querySelector('.tab-content');
            if (insertTarget) {
                insertTarget.parentNode.insertBefore(analysisPanel, insertTarget.nextSibling);
            }
        }

        let content = `<h3>🔍 ${panelTitle}</h3>`;

        if (analysis.qualityScore !== undefined) {
            const scoreClass = analysis.qualityScore >= 8 ? 'high' :
                             analysis.qualityScore >= 6 ? 'medium' : 'low';
            content += `
                <div class="ai-analysis-section">
                    <h4>📊 Quality Score</h4>
                    <div class="ai-quality-score ${scoreClass}">${analysis.qualityScore}/10</div>
                </div>
            `;
        }

        if (analysis.strengths?.length) {
            content += `
                <div class="ai-analysis-section">
                    <h4>✅ Strengths</h4>
                    <ul class="ai-analysis-list">
                        ${analysis.strengths.map(s => `<li>${this.escapeHtml(s)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (analysis.improvements?.length || analysis.recommendations?.length) {
            const items = analysis.improvements || analysis.recommendations || [];
            content += `
                <div class="ai-analysis-section">
                    <h4>💡 Recommendations</h4>
                    <ul class="ai-analysis-list">
                        ${items.map(i => `<li>${this.escapeHtml(i)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        if (analysis.missedIntents?.length) {
            content += `
                <div class="ai-analysis-section">
                    <h4>❓ Missed Intents</h4>
                    <ul class="ai-analysis-list">
                        ${analysis.missedIntents.map(m => `<li>${this.escapeHtml(m)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        content += `<button class="btn btn-sm" onclick="this.parentNode.remove()">Close Analysis</button>`;

        analysisPanel.innerHTML = content;
        this.showToast('Analysis complete', 'success');
    }

    /**
     * Insert all AI suggestions
     */
    handleInsertAllSuggestions() {
        if (!this.currentAISuggestions || this.currentAISuggestions.length === 0) {
            this.showToast('No suggestions to insert', 'warning');
            return;
        }

        this.currentAISuggestions.forEach(suggestion => {
            this.insertAISuggestion(suggestion);
        });

        this.showToast(`Inserted ${this.currentAISuggestions.length} suggestions`, 'success');
    }

    /**
     * Clear AI suggestions
     */
    handleClearSuggestions() {
        const suggestionsContainer = document.getElementById('ai-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }

        const goalInput = document.getElementById('ai-goal-input');
        if (goalInput) {
            goalInput.value = '';
        }

        this.currentAISuggestions = [];
        this.showToast('Suggestions cleared', 'info');
    }

    /**
     * Get current test agent
     */
    getCurrentTestAgent() {
        // Return the most recently created agent
        const agents = Array.from(this.agents.values());
        return agents.length > 0 ? agents[agents.length - 1] : null;
    }

    /**
     * Get active script tab
     */
    getActiveScriptTab() {
        const activeTab = document.querySelector('.tab-item.active');
        if (!activeTab) return null;

        const tabId = activeTab.getAttribute('data-tab');
        return document.querySelector(`[data-tab-content="${tabId}"]`);
    }

    /**
     * Get script from tab
     */
    getScriptFromTab(tabElement) {
        if (!tabElement) return null;

        const scriptId = tabElement.getAttribute('data-script-id');
        return this.scripts.get(scriptId);
    }

    /**
     * Show loading spinner
     */
    showLoading(show = true) {
        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span>${this.escapeHtml(message)}</span>
        `;

        this.elements.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Open new script modal
     */
    openNewScriptModal() {
        this.showModal(this.elements.newScriptModal);

        // Focus on script name input
        setTimeout(() => {
            const nameInput = document.getElementById('script-name');
            if (nameInput) nameInput.focus();
        }, 100);
    }

    /**
     * Open settings modal
     */
    openSettingsModal() {
        this.populateSettings();
        this.showModal(this.elements.settingsModal);
    }

    /**
     * Show modal
     */
    showModal(modal) {
        if (modal) {
            modal.classList.add('show');
        }
    }

    /**
     * Close modal
     */
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Handle new script form submission
     */
    async handleNewScriptSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            sessionId: this.sessionId,
            name: formData.get('name'),
            type: formData.get('type'),
            template: formData.get('template')
        };

        try {
            this.showLoading(true);
            const response = await this.apiCall('POST', '/script/create', data);

            if (response.success) {
                this.scripts.set(response.script.id, response.script);
                this.updateScriptList();
                this.openScriptTab(response.script);
                this.closeModal(this.elements.newScriptModal);
                this.showToast('Script created successfully', 'success');

                // Reset form
                e.target.reset();
            }
        } catch (error) {
            this.showToast('Failed to create script: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Create quick start script
     */
    async createQuickStartScript() {
        const quickStartData = {
            sessionId: this.sessionId,
            name: 'Quick Start Bot',
            type: 'moringa',
            template: 'basic-bot'
        };

        try {
            const response = await this.apiCall('POST', '/script/create', quickStartData);

            if (response.success) {
                this.scripts.set(response.script.id, response.script);
                this.updateScriptList();
                this.openScriptTab(response.script);
                this.showToast('Quick start script created', 'success');
            }
        } catch (error) {
            this.showToast('Failed to create quick start script: ' + error.message, 'error');
        }
    }

    /**
     * Update script list in sidebar
     */
    updateScriptList() {
        if (!this.elements.scriptList) return;

        if (this.scripts.size === 0) {
            this.elements.scriptList.innerHTML = `
                <div class="empty-state">
                    <p>No scripts yet</p>
                    <small>Create your first MoringaScript</small>
                </div>
            `;
            return;
        }

        let html = '';
        for (const [id, script] of this.scripts) {
            html += `
                <div class="script-item ${script.id === this.currentScript?.id ? 'active' : ''}"
                     data-script-id="${script.id}">
                    <div class="script-info">
                        <span class="script-name">${this.escapeHtml(script.name)}</span>
                        <span class="script-meta">${script.type} • v${script.version}</span>
                    </div>
                    <div class="script-actions">
                        <button class="btn btn-xs" onclick="studio.openScriptTab('${script.id}')" title="Edit">✏️</button>
                        <button class="btn btn-xs" onclick="studio.testScript('${script.id}')" title="Test">▶</button>
                        <button class="btn btn-xs" onclick="studio.deleteScript('${script.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        }

        this.elements.scriptList.innerHTML = html;
    }

    /**
     * Open script in editor tab
     */
    async openScriptTab(scriptOrId) {
        let script;

        if (typeof scriptOrId === 'string') {
            script = this.scripts.get(scriptOrId);
            if (!script) {
                try {
                    const response = await this.apiCall('GET', `/script/${scriptOrId}`, {
                        sessionId: this.sessionId
                    });
                    script = response.script;
                    this.scripts.set(script.id, script);
                } catch (error) {
                    this.showToast('Failed to load script: ' + error.message, 'error');
                    return;
                }
            }
        } else {
            script = scriptOrId;
        }

        const tabId = `script-${script.id}`;

        if (this.tabs.has(tabId)) {
            this.activateTab(tabId);
            return;
        }

        // Create new tab
        this.createTab(tabId, `📜 ${script.name}`, 'script');
        this.setupScriptEditor(tabId, script);
        this.activateTab(tabId);
        this.currentScript = script;
        this.updateScriptList();
    }

    /**
     * Create a new tab
     */
    createTab(id, title, type) {
        // Create tab button
        const tabButton = document.createElement('div');
        tabButton.className = 'tab-item';
        tabButton.setAttribute('data-tab', id);
        tabButton.innerHTML = `
            <span class="tab-icon">${this.getTabIcon(type)}</span>
            ${this.escapeHtml(title)}
            <button class="tab-close" data-tab="${id}">×</button>
        `;

        this.elements.tabList.appendChild(tabButton);

        // Create tab content
        const template = this.getTabTemplate(type);
        if (template) {
            const tabContent = template.cloneNode(true);
            tabContent.id = `tab-${id}`;
            tabContent.classList.remove('tab-pane');
            tabContent.classList.add('tab-pane');
            tabContent.style.display = 'none';

            this.elements.tabContent.appendChild(tabContent);

            this.tabs.set(id, {
                id,
                title,
                type,
                element: tabContent,
                button: tabButton
            });
        }
    }

    /**
     * Get tab icon based on type
     */
    getTabIcon(type) {
        const icons = {
            welcome: '🏠',
            script: '📜',
            chat: '💬',
            validator: '✓',
            statemachine: '🗂️',
            performance: '⚡'
        };
        return icons[type] || '📄';
    }

    /**
     * Get tab template based on type
     */
    getTabTemplate(type) {
        const templateMap = {
            script: this.elements.scriptTabTemplate,
            chat: this.elements.chatTabTemplate,
            validator: document.getElementById('tab-validator-template'),
            statemachine: document.getElementById('tab-statemachine-template')
        };
        return templateMap[type];
    }

    /**
     * Setup script editor
     */
    setupScriptEditor(tabId, script) {
        const tabElement = this.tabs.get(tabId).element;
        const textarea = tabElement.querySelector('.script-textarea');
        const scriptName = tabElement.querySelector('.script-name');
        const scriptStatus = tabElement.querySelector('.script-status');

        // Set initial content
        if (textarea) {
            textarea.value = script.content || this.getScriptTemplate(script.type);
        }

        if (scriptName) {
            scriptName.textContent = script.name;
        }

        // Bind events
        if (textarea) {
            textarea.addEventListener('input', () => {
                this.handleScriptEdit(script, textarea.value);
                this.updateEditorStats(tabElement, textarea.value);

                if (scriptStatus) {
                    scriptStatus.className = 'script-status modified';
                }
            });
        }

        // Bind toolbar buttons
        const toolbar = tabElement.querySelector('.editor-toolbar');
        if (toolbar) {
            toolbar.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action) {
                    this.handleEditorAction(action, script, tabElement);
                }
            });
        }

        // Initial stats update
        if (textarea) {
            this.updateEditorStats(tabElement, textarea.value);
        }
    }

    /**
     * Get script template based on type
     */
    getScriptTemplate(type) {
        const templates = {
            'basic-bot': `// Basic Moringa Chatbot Template

Memories
    "I am a helpful assistant"
    "I can answer questions and help with tasks"

recognizer "hello" priority=10
    say "Hello! How can I help you today?"

recognizer "my name is [name]" priority=8
    remember "user name is [name|capitalize]" type="string" scope="session"
    say "Nice to meet you, [name|title_case]!"

recognizer "help" priority=7
    say "I can help you with various tasks. What would you like to know?"

recognizer "goodbye" priority=6
    say "Goodbye! Have a great day!"`,

            'customer-service': `// Customer Service Bot Template

Memories
    "I provide customer support"
    "I can help with billing, technical issues, and accounts"

recognizer "hello" priority=10
    say "Welcome to customer service! How can I assist you today?"

recognizer "billing" priority=9
    say "I can help with billing questions. What specific issue are you having?"

recognizer "technical support" priority=9
    say "I'm here to help with technical issues. What problem are you experiencing?"

recognizer "account" priority=8
    say "I can assist with account-related questions. What do you need help with?"

recognizer "speak to human" priority=7
    say "I'll connect you with a human agent. Please hold on..."`,

            'survey-bot': `// Survey Bot Template

Memories
    "I conduct surveys and collect feedback"

recognizer "start survey" priority=10
    say "Great! I'd like to ask you a few questions. What's your name?"

recognizer "my name is [name]" priority=9
    remember "user name is [name|capitalize]" type="string" scope="session"
    say "Thank you, [name|title_case]! How satisfied are you with our service? (1-10)"

recognizer "[rating]" priority=8
    remember "satisfaction rating is [rating]" type="integer"
    say "Thank you for the rating! Any additional comments?"

recognizer "no comments" priority=7
    say "Thank you for completing our survey, [name]!"`,

            default: `// New Moringa Script

recognizer "hello"
    say "Hello! This is a new Moringa script."

recognizer "help"
    say "I'm a chatbot created with Moringa. You can teach me new responses!"
`
        };

        return templates[type] || templates.default;
    }

    /**
     * Handle script editing
     */
    handleScriptEdit(script, content) {
        script.content = content;
        script.modified = new Date();

        // Auto-save if enabled
        if (this.settings.autoSave) {
            clearTimeout(this.autoSaveTimer);
            this.autoSaveTimer = setTimeout(() => {
                this.saveScript(script);
            }, 2000);
        }
    }

    /**
     * Update editor statistics
     */
    updateEditorStats(tabElement, content) {
        const lines = content.split('\n').length;
        const chars = content.length;
        const recognizers = (content.match(/recognizer\s+/g) || []).length;

        const lineCount = tabElement.querySelector('.line-count');
        const charCount = tabElement.querySelector('.char-count');
        const recognizerCount = tabElement.querySelector('.recognizer-count');

        if (lineCount) lineCount.textContent = `Lines: ${lines}`;
        if (charCount) charCount.textContent = `Characters: ${chars}`;
        if (recognizerCount) recognizerCount.textContent = `Recognizers: ${recognizers}`;
    }

    /**
     * Handle editor toolbar actions
     */
    async handleEditorAction(action, script, tabElement) {
        switch (action) {
            case 'validate':
                await this.validateScript(script, tabElement);
                break;
            case 'test':
                await this.testScript(script.id);
                break;
            case 'save':
                await this.saveScript(script);
                break;
        }
    }

    /**
     * Validate script
     */
    async validateScript(script, tabElement) {
        try {
            const response = await this.apiCall('POST', '/script/validate', {
                content: script.content
            });

            const validationResult = tabElement.querySelector('.validation-result');
            if (validationResult) {
                if (response.valid) {
                    validationResult.textContent = `Valid (${response.recognizerCount} recognizers)`;
                    validationResult.className = 'validation-result';
                    this.showToast('Script is valid', 'success');
                } else {
                    validationResult.textContent = `Error: ${response.error}`;
                    validationResult.className = 'validation-result error';
                    this.showToast('Script validation failed', 'error');
                }
            }
        } catch (error) {
            this.showToast('Validation failed: ' + error.message, 'error');
        }
    }

    /**
     * Test script by creating agent and opening chat
     */
    async testScript(scriptId) {
        const script = this.scripts.get(scriptId);
        if (!script) return;

        try {
            this.showLoading(true);

            // Create test agent
            const response = await this.apiCall('POST', '/agent/create', {
                sessionId: this.sessionId,
                scriptId: script.id,
                name: `${script.name} Test Agent`
            });

            if (response.success) {
                const agent = {
                    id: response.agentId,
                    name: `${script.name} Test Agent`,
                    scriptId: script.id,
                    status: 'active'
                };

                this.agents.set(agent.id, agent);
                this.updateAgentList();
                this.openChatTab(agent);
                this.showToast('Test agent created', 'success');
            }
        } catch (error) {
            this.showToast('Failed to create test agent: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Save script
     */
    async saveScript(script) {
        try {
            const response = await this.apiCall('PUT', `/script/${script.id}`, {
                sessionId: this.sessionId,
                content: script.content,
                name: script.name
            });

            if (response.success) {
                script.version = response.script.version;
                script.modified = response.script.modified;
                this.showToast('Script saved', 'success');

                // Update status indicator
                const tabElement = this.tabs.get(`script-${script.id}`)?.element;
                if (tabElement) {
                    const scriptStatus = tabElement.querySelector('.script-status');
                    if (scriptStatus) {
                        scriptStatus.className = 'script-status';
                    }
                }
            }
        } catch (error) {
            this.showToast('Failed to save script: ' + error.message, 'error');
        }
    }

    /**
     * Update agent list in sidebar
     */
    updateAgentList() {
        if (!this.elements.agentList) return;

        if (this.agents.size === 0) {
            this.elements.agentList.innerHTML = `
                <div class="empty-state">
                    <p>No test agents</p>
                    <small>Create a script first</small>
                </div>
            `;
            return;
        }

        let html = '';
        for (const [id, agent] of this.agents) {
            html += `
                <div class="agent-item ${agent.id === this.currentAgent?.id ? 'active' : ''}"
                     data-agent-id="${agent.id}">
                    <div class="agent-info">
                        <span class="agent-name">${this.escapeHtml(agent.name)}</span>
                        <span class="agent-meta">${agent.status}</span>
                    </div>
                    <div class="agent-actions">
                        <button class="btn btn-xs" onclick="studio.openChatTab('${agent.id}')" title="Chat">💬</button>
                        <button class="btn btn-xs" onclick="studio.stopAgent('${agent.id}')" title="Stop">⏹️</button>
                    </div>
                </div>
            `;
        }

        this.elements.agentList.innerHTML = html;
    }

    /**
     * Open chat tab for agent
     */
    openChatTab(agentOrId) {
        let agent;

        if (typeof agentOrId === 'string') {
            agent = this.agents.get(agentOrId);
        } else {
            agent = agentOrId;
        }

        if (!agent) return;

        const tabId = `chat-${agent.id}`;

        if (this.tabs.has(tabId)) {
            this.activateTab(tabId);
            return;
        }

        // Create new chat tab
        this.createTab(tabId, `💬 ${agent.name}`, 'chat');
        this.setupChatInterface(tabId, agent);
        this.activateTab(tabId);
        this.currentAgent = agent;
        this.updateAgentList();
    }

    /**
     * Setup chat interface
     */
    setupChatInterface(tabId, agent) {
        const tabElement = this.tabs.get(tabId).element;
        const agentName = tabElement.querySelector('.agent-name');
        const chatMessages = tabElement.querySelector('.chat-messages');
        const chatInput = tabElement.querySelector('.chat-input-field');
        const sendBtn = tabElement.querySelector('#send-message-btn') ||
                       tabElement.querySelector('.btn-primary');

        if (agentName) {
            agentName.textContent = agent.name;
        }

        // Clear existing messages and add welcome
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-content">
                        <strong>Bot:</strong> Hello! I'm your test agent. Send me a message to test the script.
                    </div>
                    <div class="message-time">Ready</div>
                </div>
            `;
        }

        // Bind send message event
        const sendMessage = async () => {
            const message = chatInput?.value?.trim();
            if (!message) return;

            await this.sendChatMessage(agent, message, chatMessages, chatInput);
        };

        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
        }

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        // Bind header actions
        const chatHeader = tabElement.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                if (action) {
                    this.handleChatAction(action, agent, tabElement);
                }
            });
        }
    }

    /**
     * Send chat message
     */
    async sendChatMessage(agent, message, chatMessages, chatInput) {
        // Add user message to UI
        this.addChatMessage(chatMessages, message, 'user');

        // Clear input
        if (chatInput) {
            chatInput.value = '';
        }

        // Show typing indicator
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }

        try {
            const response = await this.apiCall('POST', `/agent/${agent.id}/input`, {
                message: message,
                userName: 'User'
            });

            if (response.success && response.messages) {
                // Add bot messages (there might be multiple from the action chain)
                const botMessages = response.messages.filter(m => m.type === 'bot');
                botMessages.forEach(botMsg => {
                    this.addChatMessage(chatMessages, botMsg.content, 'bot');
                });

                // If no bot messages, show acknowledgment
                if (botMessages.length === 0) {
                    this.addChatMessage(chatMessages, "Message received (no response pattern matched)", 'bot', true);
                }
            }
        } catch (error) {
            this.addChatMessage(chatMessages, `Error: ${error.message}`, 'bot', true);
        } finally {
            // Hide typing indicator
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        }
    }

    /**
     * Add message to chat UI
     */
    addChatMessage(chatMessages, content, type, isSystem = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const now = new Date().toLocaleTimeString();
        const label = type === 'user' ? 'You' : 'Bot';

        messageDiv.innerHTML = `
            <div class="message-content ${isSystem ? 'system' : ''}">
                <strong>${label}:</strong> ${this.escapeHtml(content)}
            </div>
            <div class="message-time">${now}</div>
        `;

        if (chatMessages) {
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    /**
     * Handle tab click events
     */
    handleTabClick(e) {
        const tabItem = e.target.closest('.tab-item');
        const closeBtn = e.target.closest('.tab-close');

        if (closeBtn) {
            e.stopPropagation();
            const tabId = closeBtn.getAttribute('data-tab');
            this.closeTab(tabId);
        } else if (tabItem) {
            const tabId = tabItem.getAttribute('data-tab');
            this.activateTab(tabId);
        }
    }

    /**
     * Activate a tab
     */
    activateTab(tabId) {
        // Deactivate all tabs
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });

        // Activate selected tab
        const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
        const tabPane = document.getElementById(`tab-${tabId}`);

        if (tabButton) {
            tabButton.classList.add('active');
        }

        if (tabPane) {
            tabPane.classList.add('active');
        }

        this.activeTab = tabId;
    }

    /**
     * Close a tab
     */
    closeTab(tabId) {
        const tab = this.tabs.get(tabId);
        if (!tab) return;

        // Remove tab elements
        if (tab.button && tab.button.parentNode) {
            tab.button.parentNode.removeChild(tab.button);
        }

        if (tab.element && tab.element.parentNode) {
            tab.element.parentNode.removeChild(tab.element);
        }

        this.tabs.delete(tabId);

        // Activate another tab if this was active
        if (this.activeTab === tabId) {
            const remainingTabs = Array.from(this.tabs.keys());
            if (remainingTabs.length > 0) {
                this.activateTab(remainingTabs[0]);
            } else {
                this.activateTab('welcome');
            }
        }
    }

    /**
     * Open a tool tab
     */
    openTab(id, title, type) {
        if (this.tabs.has(id)) {
            this.activateTab(id);
            return;
        }

        this.createTab(id, title, type);
        this.activateTab(id);
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboard(e) {
        // Ctrl/Cmd + S: Save current script
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (this.currentScript) {
                this.saveScript(this.currentScript);
            }
        }

        // Ctrl/Cmd + N: New script
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.openNewScriptModal();
        }

        // Ctrl/Cmd + T: New chat test
        if ((e.ctrlKey || e.metaKey) && e.key === 't') {
            e.preventDefault();
            if (this.currentScript) {
                this.testScript(this.currentScript.id);
            }
        }

        // Escape: Close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                this.closeModal(modal);
            });
        }
    }

    /**
     * Handle before unload (prevent data loss)
     */
    handleBeforeUnload(e) {
        const hasUnsaved = Array.from(this.scripts.values()).some(script =>
            script.modified && !script.saved
        );

        if (hasUnsaved) {
            e.preventDefault();
            e.returnValue = 'You have unsaved scripts. Are you sure you want to leave?';
            return e.returnValue;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Could implement responsive behavior here
    }

    /**
     * Close side panel
     */
    closeSidePanel() {
        if (this.elements.sidePanel) {
            this.elements.sidePanel.style.display = 'none';
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('moringa-studio-settings');
            return saved ? JSON.parse(saved) : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            theme: 'dark',
            autoSave: true,
            debugLevel: 'info'
        };
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            // Collect settings from form
            const theme = document.getElementById('theme-select')?.value || this.settings.theme;
            const autoSave = document.getElementById('auto-save')?.checked ?? this.settings.autoSave;
            const debugLevel = document.getElementById('debug-level')?.value || this.settings.debugLevel;

            this.settings = {
                theme,
                autoSave,
                debugLevel
            };

            localStorage.setItem('moringa-studio-settings', JSON.stringify(this.settings));
            this.applyTheme();
            this.closeModal(this.elements.settingsModal);
            this.showToast('Settings saved', 'success');

        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    /**
     * Populate settings form
     */
    populateSettings() {
        const themeSelect = document.getElementById('theme-select');
        const autoSaveCheck = document.getElementById('auto-save');
        const debugLevelSelect = document.getElementById('debug-level');

        if (themeSelect) themeSelect.value = this.settings.theme;
        if (autoSaveCheck) autoSaveCheck.checked = this.settings.autoSave;
        if (debugLevelSelect) debugLevelSelect.value = this.settings.debugLevel;
    }

    /**
     * Apply theme
     */
    applyTheme() {
        document.body.className = `theme-${this.settings.theme}`;
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.eventSource) {
            this.eventSource.close();
        }

        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
    }
}

// Make studio globally available for onclick handlers
let studio;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MoringaDevStudio;
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.MoringaDevStudio = MoringaDevStudio;
}