/**
 * 全局类型定义
 */

// ==================== AI服务提供商 ====================

export enum AIProvider {
	Anthropic = 'anthropic',
	OpenAI = 'openai',
	Zhipu = 'zhipu',          // 智谱GLM
	Qwen = 'qwen',            // 通义千问
	DeepSeek = 'deepseek',    // DeepSeek
	Moonshot = 'moonshot',    // 月之暗面Kimi
}

export interface AIProviderConfig {
	name: string;
	baseUrl: string;
	models: string[];
	defaultModel: string;
	envKey: string;
}

// AI服务提供商配置
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
	[AIProvider.Anthropic]: {
		name: 'Anthropic (Claude)',
		baseUrl: 'https://api.anthropic.com',
		models: [
			'claude-3-5-sonnet-20241022',
			'claude-3-opus-20240229',
			'claude-3-sonnet-20240229',
			'claude-3-haiku-20240307'
		],
		defaultModel: 'claude-3-5-sonnet-20241022',
		envKey: 'ANTHROPIC_API_KEY'
	},
	[AIProvider.OpenAI]: {
		name: 'OpenAI (GPT)',
		baseUrl: 'https://api.openai.com/v1',
		models: [
			'gpt-4o',
			'gpt-4o-mini',
			'gpt-4-turbo',
			'gpt-3.5-turbo'
		],
		defaultModel: 'gpt-4o-mini',
		envKey: 'OPENAI_API_KEY'
	},
	[AIProvider.Zhipu]: {
		name: '智谱AI (GLM)',
		baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
		models: [
			'glm-4-plus',
			'glm-4-air',
			'glm-4-flash',
			'glm-4'
		],
		defaultModel: 'glm-4-flash',
		envKey: 'ZHIPUAI_API_KEY'
	},
	[AIProvider.Qwen]: {
		name: '阿里云 (通义千问)',
		baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
		models: [
			'qwen-max',
			'qwen-plus',
			'qwen-turbo',
			'qwen-long'
		],
		defaultModel: 'qwen-plus',
		envKey: 'DASHSCOPE_API_KEY'
	},
	[AIProvider.DeepSeek]: {
		name: 'DeepSeek',
		baseUrl: 'https://api.deepseek.com',
		models: [
			'deepseek-chat',
			'deepseek-coder'
		],
		defaultModel: 'deepseek-chat',
		envKey: 'DEEPSEEK_API_KEY'
	},
	[AIProvider.Moonshot]: {
		name: '月之暗面 (Kimi)',
		baseUrl: 'https://api.moonshot.cn/v1',
		models: [
			'moonshot-v1-8k',
			'moonshot-v1-32k',
			'moonshot-v1-128k'
		],
		defaultModel: 'moonshot-v1-8k',
		envKey: 'MOONSHOT_API_KEY'
	}
};

// ==================== API 相关类型 ====================

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface ApiRequest {
	messages: Message[];
	model?: string;
	maxTokens?: number;
	temperature?: number;
	provider?: AIProvider;
}

export interface ApiResponse {
	content: string;
	model: string;
	usage?: {
		inputTokens: number;
		outputTokens: number;
	};
}

// ==================== 认证相关类型 ====================

export interface AuthConfig {
	provider: AIProvider;
	apiKeys: Partial<Record<AIProvider, string>>;
	useEnvVariable?: boolean;
}

// ==================== Skills 相关类型 ====================

export interface Skill {
	id: string;
	name: string;
	description: string;
	icon?: string;
	category: 'predefined' | 'custom';
	execute: (context: SkillContext) => Promise<SkillResult>;
}

export interface SkillContext {
	input: string;
	selection?: string;
	metadata?: Record<string, any>;
}

export interface SkillResult {
	success: boolean;
	content: string;
	error?: string;
	metadata?: Record<string, any>;
}

export interface CustomSkillConfig {
	id: string;
	name: string;
	description: string;
	promptTemplate: string;
	icon?: string;
}

// ==================== SubAgent 相关类型 ====================

export interface SubAgentTask {
	id: string;
	description: string;
	prompt: string;
	dependencies?: string[]; // 依赖的任务ID列表
	priority?: number;
}

export interface SubAgentResult {
	taskId: string;
	success: boolean;
	content: string;
	error?: string;
	executionTime: number;
}

export interface AggregatedResult {
	totalTasks: number;
	successfulTasks: number;
	failedTasks: number;
	results: SubAgentResult[];
	mergedContent?: string;
	totalExecutionTime: number;
}

export enum ExecutionMode {
	Parallel = 'parallel',
	Sequential = 'sequential',
	Hybrid = 'hybrid'
}

export enum MergeStrategy {
	Concatenate = 'concatenate',
	SmartSummary = 'smartSummary',
	CustomStructure = 'customStructure'
}

export interface DecompositionConstraints {
	maxSubTasks?: number;
	maxDepth?: number;
	allowDependencies?: boolean;
}

// ==================== UI 相关类型 ====================

export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	isStreaming?: boolean;
}

export interface ConversationSession {
	id: string;
	title: string;
	messages: ChatMessage[];
	createdAt: number;
	updatedAt: number;
}

// ==================== 插件设置类型 ====================

export interface ClaudeAIPluginSettings {
	// AI服务提供商选择
	provider: AIProvider;

	// 多个API Key（支持不同服务商）
	apiKeys: {
		anthropic?: string;
		openai?: string;
		zhipu?: string;
		qwen?: string;
		deepseek?: string;
		moonshot?: string;
	};

	// 模型设置
	model: string;
	maxTokens: number;
	temperature: number;
	enableStreaming: boolean;

	// UI设置
	sidebarWidth: number;

	// Skills
	customSkills: CustomSkillConfig[];
}

export const DEFAULT_SETTINGS: ClaudeAIPluginSettings = {
	provider: AIProvider.Zhipu, // 默认使用智谱GLM
	apiKeys: {
		anthropic: '',
		openai: '',
		zhipu: '',
		qwen: '',
		deepseek: '',
		moonshot: ''
	},
	model: 'glm-4-flash',
	maxTokens: 4096,
	temperature: 0.7,
	enableStreaming: true,
	sidebarWidth: 400,
	customSkills: []
};
