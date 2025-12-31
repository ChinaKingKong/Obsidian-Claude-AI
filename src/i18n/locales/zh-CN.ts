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
		sendFailed: '发送失败',
		configureApiKey: '⚠️ 请先在设置中配置API Key',
		skillsPanelInDev: 'Skills面板开发中...',
	},

	// 设置面板
	settings: {
		title: 'Claude AI Assistant 设置',
		aiService: 'AI服务设置',
		aiServiceDesc: '选择要使用的AI服务提供商',
		apiKey: 'API Key',
		apiKeyDesc: '输入对应服务商的API密钥',
		model: '模型设置',
		modelDesc: '选择要使用的AI模型',
		language: '语言',
		languageDesc: '选择界面显示语言',
		save: '保存设置',
		uiSettings: '界面设置',
		skillsSettings: 'Skills设置',
		apiKeyConfig: 'API Key配置',
		providerInfo: '服务商信息',
		otherProviders: '配置其他服务商的API Key（可选）',
		currentApiSource: '当前API来源',
		currentApiSourceDesc: '显示当前API Key的来源',
		checking: '检测中...',
		fromEnv: '环境变量',
		fromSettings: '设置面板',
		notConfigured: '未配置',
		maxTokens: '最大Tokens',
		maxTokensDesc: '单次请求的最大token数',
		temperature: '温度',
		temperatureDesc: '控制输出的随机性（0-1）',
		enableStreaming: '启用流式输出',
		enableStreamingDesc: '实时显示AI的响应',
		sidebarWidth: '侧边栏宽度',
		sidebarWidthDesc: '设置侧边栏的宽度（像素）',
		predefinedSkills: '预定义Skills',
		predefinedSkillsDesc: '可用的预定义Skills',
		customSkills: '自定义Skills',
		customSkillsDesc: '管理你的自定义Skills',
		addCustomSkill: '添加自定义Skill',
		addedCustomSkills: '已添加的自定义Skills',
		delete: '删除',
		enterApiKey: '输入API Key',
		enterApiKeyOptional: '输入API Key（可选）',
		enterYourProviderApiKey: '输入你的 {provider} API Key（或使用环境变量：{envKey}）',
		skillName: 'Skill名称',
		skillDescription: 'Skill描述',
		promptTemplate: '提示词模板（使用{{input}}表示输入）',
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
