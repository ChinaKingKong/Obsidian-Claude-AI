import { LocaleStrings } from '../i18n';

export const enUS: LocaleStrings = {
	// Common
	common: {
		ready: 'Ready',
		loading: 'Loading...',
		error: 'Error',
		success: 'Success',
		copy: 'Copy',
		copySuccess: 'Copied to clipboard',
	},

	// Header
	header: {
		title: 'Obsidian Claude AI Assistant',
		settings: 'Settings',
	},

	// Chat View
	chatView: {
		placeholder: 'Send a message to Claude...',
		sending: 'Sending...',
		aiTitle: 'Claude AI',
		reply: 'Reply',
		defaultTitle: 'Reply',
		sendFailed: 'Send failed',
		configureApiKey: '⚠️ Please configure API Key in settings first',
		skillsPanelInDev: 'Skills panel in development...',
	},

	// Settings
	settings: {
		title: 'Claude AI Assistant Settings',
		aiService: 'AI Service Provider',
		aiServiceDesc: 'Select the AI service provider to use',
		apiKey: 'API Key',
		apiKeyDesc: 'Enter the API key for the selected provider',
		model: 'Model Settings',
		modelDesc: 'Select the AI model to use',
		language: 'Language',
		languageDesc: 'Select the interface display language',
		save: 'Save Settings',
		uiSettings: 'UI Settings',
		skillsSettings: 'Skills Settings',
		apiKeyConfig: 'API Key Configuration',
		providerInfo: 'Provider Info',
		otherProviders: 'Configure other providers\' API Keys (optional)',
		currentApiSource: 'Current API Source',
		currentApiSourceDesc: 'Display current API Key source',
		checking: 'Checking...',
		fromEnv: 'Environment Variable',
		fromSettings: 'Settings Panel',
		notConfigured: 'Not Configured',
		maxTokens: 'Max Tokens',
		maxTokensDesc: 'Maximum tokens per request',
		temperature: 'Temperature',
		temperatureDesc: 'Control output randomness (0-1)',
		enableStreaming: 'Enable Streaming',
		enableStreamingDesc: 'Display AI responses in real-time',
		sidebarWidth: 'Sidebar Width',
		sidebarWidthDesc: 'Set sidebar width (pixels)',
		predefinedSkills: 'Predefined Skills',
		predefinedSkillsDesc: 'Available predefined skills',
		customSkills: 'Custom Skills',
		customSkillsDesc: 'Manage your custom skills',
		addCustomSkill: 'Add Custom Skill',
		addedCustomSkills: 'Added Custom Skills',
		delete: 'Delete',
		enterApiKey: 'Enter API Key',
		enterApiKeyOptional: 'Enter API Key (optional)',
		enterYourProviderApiKey: 'Enter your {provider} API Key (or use env var: {envKey})',
		skillName: 'Skill Name',
		skillDescription: 'Skill Description',
		promptTemplate: 'Prompt Template (use {{input}} for input)',
	},

	// AI Providers
	providers: {
		anthropic: 'Anthropic (Claude)',
		openai: 'OpenAI (GPT)',
		zhipu: 'Zhipu AI (GLM)',
		qwen: 'Alibaba Cloud (Qwen)',
		deepseek: 'DeepSeek',
		moonshot: 'Moonshot (Kimi)',
	},

	// Tags
	tags: {
		thinkingMode: 'Thinking Mode',
		ready: 'Ready',
	},
};
