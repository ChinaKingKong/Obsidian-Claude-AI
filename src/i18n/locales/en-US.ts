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
	},

	// Settings
	settings: {
		title: 'Claude AI Assistant Settings',
		aiService: 'AI Service Provider',
		aiServiceDesc: 'Select the AI service provider to use',
		apiKey: 'API Key',
		apiKeyDesc: 'Enter the API key for the selected provider',
		model: 'Model',
		modelDesc: 'Select the AI model to use',
		language: 'Language',
		languageDesc: 'Select the interface display language',
		save: 'Save Settings',
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
