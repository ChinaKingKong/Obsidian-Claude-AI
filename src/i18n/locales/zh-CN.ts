import { LocaleStrings } from '../i18n';

export const zhCN: LocaleStrings = {
	// 通用
	common: {
		ready: '就绪',
		loading: '加载中...',
		error: '错误',
		success: '成功',
		copy: '复制',
		copySuccess: '复制成功',
	},

	// 头部
	header: {
		title: 'Obsidian Claude AI Assistant',
		settings: '设置',
	},

	// 聊天视图
	chatView: {
		placeholder: '给 Claude 发送消息...',
		sending: '发送中...',
		aiTitle: 'Claude AI',
		reply: '回复',
		defaultTitle: '回复',
	},

	// 设置面板
	settings: {
		title: 'Claude AI Assistant 设置',
		aiService: 'AI服务商',
		aiServiceDesc: '选择要使用的AI服务提供商',
		apiKey: 'API Key',
		apiKeyDesc: '输入对应服务商的API密钥',
		model: '模型',
		modelDesc: '选择要使用的AI模型',
		language: '语言',
		languageDesc: '选择界面显示语言',
		save: '保存设置',
	},

	// AI 服务商
	providers: {
		anthropic: 'Anthropic (Claude)',
		openai: 'OpenAI (GPT)',
		zhipu: '智谱AI (GLM)',
		qwen: '阿里云 (通义千问)',
		deepseek: 'DeepSeek',
		moonshot: '月之暗面 (Kimi)',
	},

	// 标签
	tags: {
		thinkingMode: '思考模式',
		ready: '就绪',
	},
};
